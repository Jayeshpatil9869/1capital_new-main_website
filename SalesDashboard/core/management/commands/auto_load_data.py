"""
Django management command to start the auto-loader
Usage: python manage.py auto_load_data
"""

from django.core.management.base import BaseCommand
import logging
import os
import django

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = '''
    Starts automatic file watcher for data_files folders.
    
    Monitors brokerage_fact and MF_fact folders for new files.
    Automatically loads data when files are added or modified.
    
    Usage:
      python manage.py auto_load_data       # Start the watcher
      
    Install watchdog first:
      pip install watchdog
    
    The watcher will:
      - Monitor data_files/brokerage_fact/
      - Monitor data_files/MF_fact/
      - Auto-load new files with 2-second debounce
      - Log all activity to logs/auto_loader.log
    '''

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('AUTO DATA LOADER'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        try:
            # Check if watchdog is installed
            import watchdog
            self.stdout.write(self.style.SUCCESS('[OK] Watchdog module found\n'))
        except ImportError:
            self.stdout.write(self.style.ERROR('[ERROR] Watchdog not installed!'))
            self.stdout.write(self.style.WARNING('\nInstall it with:'))
            self.stdout.write(self.style.WARNING('  pip install watchdog\n'))
            return
        
        try:
            from auto_data_loader import AutoDataLoader
            
            self.stdout.write(self.style.SUCCESS('Starting automatic file watcher...'))
            self.stdout.write(self.style.WARNING('\nPress Ctrl+C to stop the watcher\n'))
            
            loader = AutoDataLoader()
            loader.start()
            
        except KeyboardInterrupt:
            self.stdout.write(self.style.SUCCESS('\n\n[OK] Auto-loader stopped'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n[ERROR] Error: {e}'))
            import traceback
            traceback.print_exc()
