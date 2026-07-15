import os
import django

# Setup Django environment
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'SalesDashboard.settings')
django.setup()

from core.data_pipeline import DataPipeline

def load_all_data():
    print("Starting initial data load and stale record pruning...")
    pipeline = DataPipeline()
    # This will prune records for deleted files and load all existing files
    pipeline.run_full_pipeline()
    print("Initialization complete. Database is synchronized with filesystem.")

if __name__ == '__main__':
    load_all_data()
