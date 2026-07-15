import pandas as pd
from django.core.management.base import BaseCommand
from django.contrib.auth.models import User
from django.conf import settings
from core.models import SalesRecord, UserProfile
from core.data_pipeline import DataPipeline
from django.db import transaction
import logging

logger = logging.getLogger(__name__)

class Command(BaseCommand):
    help = '''
    Loads sales data from data_files folder using the automated ETL pipeline.
    
    Processes:
    - Employee_dim: RM/MA organizational data
    - Client_dim: Client master records
    - brokerage_fact: Brokerage transaction data
    - MF_fact: Mutual Fund transaction data
    
    Usage:
      python manage.py load_sales_data                    # Incremental load
      python manage.py load_sales_data --clear             # Full reload (clears dimensions)
      python manage.py load_sales_data --brokerage-only    # Only brokerage/MF facts
    '''

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing data before loading'
        )
        parser.add_argument(
            '--brokerage-only',
            action='store_true',
            help='Only load brokerage and MF facts (skip dimensions)'
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('=' * 80))
        self.stdout.write(self.style.SUCCESS('SALES DATA PIPELINE - Management Command'))
        self.stdout.write(self.style.SUCCESS('=' * 80))
        
        # Configure logging
        logging.basicConfig(
            level=logging.INFO,
            format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
        )
        
        try:
            pipeline = DataPipeline()
            
            if options['brokerage_only']:
                self.stdout.write(self.style.WARNING('\nLoading brokerage and MF facts only...'))
                brokerage_count = pipeline._load_brokerage_facts()
                mf_count = pipeline._load_mf_facts()
                
                self.stdout.write(self.style.SUCCESS(f'\n[OK] Loaded {brokerage_count} brokerage records'))
                self.stdout.write(self.style.SUCCESS(f'[OK] Loaded {mf_count} MF records'))
            else:
                # Run full pipeline
                pipeline.run_full_pipeline(clear_existing=options['clear'])
                
                # Print summary
                self.stdout.write('\n' + self.style.SUCCESS('FINAL STATISTICS:'))
                self.stdout.write('-' * 80)
                
                from core.models import Employee, Client, SalesRecord
                self.stdout.write(f"  Employees: {Employee.objects.count()}")
                self.stdout.write(f"  Clients: {Client.objects.count()}")
                self.stdout.write(f"  Sales Records: {SalesRecord.objects.count()}")
                
                # Aggregate statistics
                from django.db.models import Sum
                totals = SalesRecord.objects.aggregate(
                    total_brokerage=Sum('total_brokerage'),
                    total_mf_brokerage=Sum('mf_brokerage'),
                    brokerage_records=Sum('data_source'),
                )
                
                brokerage_total = SalesRecord.objects.filter(data_source='BROKERAGE').aggregate(
                    total=Sum('total_brokerage')
                )['total'] or 0
                
                mf_total = SalesRecord.objects.filter(data_source='MF').aggregate(
                    total=Sum('mf_brokerage')
                )['total'] or 0
                
                total_brokerage = brokerage_total + mf_total
                
                self.stdout.write(f"  Total Brokerage (Equity): INR {brokerage_total:,.2f}")
                self.stdout.write(f"  Total Brokerage (MF): INR {mf_total:,.2f}")
                self.stdout.write(f"  Combined Total: INR {total_brokerage:,.2f}")
                self.stdout.write('-' * 80)
            
            self.stdout.write(self.style.SUCCESS('\n[OK] Pipeline execution completed successfully!\n'))
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'\n[ERROR] Pipeline failed: {e}\n'))
            import traceback
            traceback.print_exc()


