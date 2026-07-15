"""
Management command to reload all data from data_files folder
Clears existing records and reloads fresh data
Usage: python manage.py reload_data
"""

from django.core.management.base import BaseCommand
from core.data_pipeline import DataPipeline
from core.models import SalesRecord
import logging

logger = logging.getLogger(__name__)


class Command(BaseCommand):
    help = 'Reload all data from data_files folder (clears existing records first)'

    def add_arguments(self, parser):
        parser.add_argument(
            '--clear',
            action='store_true',
            help='Clear all existing SalesRecord data before loading',
        )
        parser.add_argument(
            '--brokerage-only',
            action='store_true',
            help='Load only brokerage data',
        )
        parser.add_argument(
            '--mf-only',
            action='store_true',
            help='Load only MF data',
        )

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting data reload...'))
        
        if options['clear']:
            count = SalesRecord.objects.count()
            self.stdout.write(self.style.WARNING(f'[CLEAR] Clearing {count} existing records...'))
            SalesRecord.objects.all().delete()
            self.stdout.write(self.style.SUCCESS('[OK] Cleared all records'))
        
        pipeline = DataPipeline()
        
        try:
            if options['brokerage_only']:
                self.stdout.write(self.style.SUCCESS('\n[BROKERAGE] Loading Brokerage Data...'))
                count = pipeline._load_brokerage_facts()
                self.stdout.write(self.style.SUCCESS(f'[OK] Loaded {count} brokerage records'))
            
            elif options['mf_only']:
                self.stdout.write(self.style.SUCCESS('\n[MF] Loading MF Data...'))
                count = pipeline._load_mf_facts()
                self.stdout.write(self.style.SUCCESS(f'[OK] Loaded {count} MF records'))
            
            else:
                # Load both
                self.stdout.write(self.style.SUCCESS('\n[BROKERAGE] Loading Brokerage Data...'))
                brokerage_count = pipeline._load_brokerage_facts()
                self.stdout.write(self.style.SUCCESS(f'[OK] Loaded {brokerage_count} brokerage records'))
                
                self.stdout.write(self.style.SUCCESS('\n[MF] Loading MF Data...'))
                mf_count = pipeline._load_mf_facts()
                self.stdout.write(self.style.SUCCESS(f'[OK] Loaded {mf_count} MF records'))
            
            # Show summary
            total_records = SalesRecord.objects.count()
            self.stdout.write(self.style.SUCCESS(f'\n[DONE] Total records in database: {total_records}'))
            
            # Show breakdown by RM_Name
            from django.db.models import Count
            rm_counts = SalesRecord.objects.values('rm_name').annotate(count=Count('id')).order_by('-count')
            
            if rm_counts:
                self.stdout.write(self.style.SUCCESS('\n[STATS] Records by RM:'))
                for item in rm_counts:
                    self.stdout.write(f"  - {item['rm_name']}: {item['count']} records")
            
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'[ERROR] Error: {str(e)}'))
            import traceback
            traceback.print_exc()
