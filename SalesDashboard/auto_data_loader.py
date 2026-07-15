"""
Auto Data Loader - File Watcher for brokerage_fact and MF_fact folders
Automatically loads new files when they are added or modified
"""

import time
import logging
from pathlib import Path
from watchdog.observers import Observer
from watchdog.events import FileSystemEventHandler, FileModifiedEvent, FileCreatedEvent, FileDeletedEvent
import os
import django

# Setup Django
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SalesDashboard.settings')
django.setup()

from django.conf import settings
from core.data_pipeline import DataPipeline

logger = logging.getLogger(__name__)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler('logs/auto_loader.log'),
        logging.StreamHandler()
    ]
)


class DataFileHandler(FileSystemEventHandler):
    """Handles file system events for data files"""
    
    def __init__(self):
        self.last_modified = {}
        self.debounce_delay = 2  # seconds - prevent duplicate processing
        self.pipeline = DataPipeline()
    
    def on_created(self, event):
        """Triggered when a new file is created"""
        if event.is_directory:
            return
        
        if event.src_path.endswith(('.xlsx', '.csv')):
            logger.info(f"[OK] New file detected: {event.src_path}")
            self._process_file(event.src_path, 'created')
    
    def on_modified(self, event):
        """Triggered when a file is modified"""
        if event.is_directory:
            return
        
        if event.src_path.endswith(('.xlsx', '.csv')):
            # Debounce to prevent multiple triggers
            now = time.time()
            last_time = self.last_modified.get(event.src_path, 0)
            
            if now - last_time < self.debounce_delay:
                logger.debug(f"Skipping duplicate event for {event.src_path}")
                return
            
            self.last_modified[event.src_path] = now
            logger.info(f"[OK] File modified: {event.src_path}")
            self._process_file(event.src_path, 'modified')
    
    def on_deleted(self, event):
        """Triggered when a file is deleted"""
        if event.is_directory:
            return
            
        if event.src_path.endswith(('.xlsx', '.csv')):
            logger.info(f"[DELETE] File deletion detected: {event.src_path}")
            self._handle_deletion(event.src_path)
    
    def _process_file(self, file_path, event_type):
        """Process the detected file"""
        try:
            # Check which folder the file is in
            file_path_obj = Path(file_path)
            folder_name = file_path_obj.parent.name
            
            if folder_name == 'brokerage_fact':
                logger.info(f"[BROKERAGE] Processing: {file_path_obj.name}")
                count = self.pipeline._load_brokerage_facts()
                logger.info(f"[BROKERAGE] [OK] Loaded {count} brokerage records")
            
            elif folder_name == 'MF_fact':
                logger.info(f"[MF] Processing: {file_path_obj.name}")
                count = self.pipeline._load_mf_facts()
                logger.info(f"[MF] [OK] Loaded {count} MF records")
            
            else:
                logger.debug(f"File in folder '{folder_name}' - skipping auto-load")
        
        except Exception as e:
            logger.error(f"[ERROR] Error processing file: {file_path}", exc_info=True)
            
    def _handle_deletion(self, file_path):
        """Handle file deletion by removing associated records"""
        from core.models import SalesRecord
        try:
            file_name = Path(file_path).name
            deleted_count, _ = SalesRecord.objects.filter(file_name=file_name).delete()
            logger.info(f"[OK] Deleted {deleted_count} records associated with {file_name}")
        except Exception as e:
            logger.error(f"[ERROR] Error handling deletion for: {file_path}", exc_info=True)


class AutoDataLoader:
    """Main auto-loader manager"""
    
    def __init__(self):
        self.observer = None
        self.pipeline = DataPipeline()
        self.brokerage_path = self.pipeline.brokerage_fact_path
        self.mf_path = self.pipeline.mf_fact_path
    
    def start(self):
        """Start watching folders"""
        logger.info("=" * 80)
        logger.info("AUTO DATA LOADER - Starting File Watcher")
        logger.info("=" * 80)
        
        self.observer = Observer()
        event_handler = DataFileHandler()
        
        # Watch brokerage_fact folder
        if self.brokerage_path.exists():
            logger.info(f"[WATCH] Watching: {self.brokerage_path}")
            self.observer.schedule(event_handler, str(self.brokerage_path), recursive=False)
        else:
            logger.warning(f"[MISSING] Folder not found: {self.brokerage_path}")
        
        # Watch MF_fact folder
        if self.mf_path.exists():
            logger.info(f"[WATCH] Watching: {self.mf_path}")
            self.observer.schedule(event_handler, str(self.mf_path), recursive=False)
        else:
            logger.warning(f"[MISSING] Folder not found: {self.mf_path}")
        
        self.observer.start()
        logger.info("\n[OK] File watcher is now active!")
        logger.info("  - New files will be automatically loaded")
        logger.info("  - Press Ctrl+C to stop\n")
        
        try:
            while True:
                time.sleep(1)
        except KeyboardInterrupt:
            logger.info("\n\nStopping file watcher...")
            self.stop()
    
    def stop(self):
        """Stop watching folders"""
        if self.observer:
            self.observer.stop()
            self.observer.join()
            logger.info("[OK] File watcher stopped")


if __name__ == '__main__':
    loader = AutoDataLoader()
    loader.start()
