"""
Data Aggregation and Analytics Module
Provides methods to aggregate sales data for dashboard display
"""

from django.db.models import Sum, Count, Q, F, DecimalField
from django.db.models.functions import Coalesce
from decimal import Decimal
import pandas as pd
from .models import SalesRecord, Employee, Client


class BrokerageAnalytics:
    """Analytics engine for sales/brokerage data"""
    
    @staticmethod
    def get_total_brokerage(filters=None):
        """
        Get total brokerage across all sources (Equity + MF)
        
        Args:
            filters: Dict with optional keys: 'rm_name', 'rm_manager_name', 'ma_name', 
                    'client_name', 'period', 'wire_code'
        
        Returns:
            Decimal: Total brokerage amount
        """
        filters = filters or {}
        queryset = SalesRecord.objects.all()
        
        # Apply filters
        if 'rm_name' in filters and filters['rm_name']:
            queryset = queryset.filter(rm_name=filters['rm_name'])
        
        if 'ma_name' in filters and filters['ma_name']:
            selected_ma = filters['ma_name']
            # Robust MA filtering using wire codes + names
            try:
                ma_emp = Employee.objects.get(rm_name=selected_ma)
                ma_wire_codes = list(ma_emp.wire_codes.values_list('wire_code', flat=True))
                if ma_emp.wire_code:
                    ma_wire_codes.append(ma_emp.wire_code)
                
                queryset = queryset.filter(
                    Q(ma_name=selected_ma) | 
                    Q(rm_name=selected_ma) | 
                    Q(wire_code__in=ma_wire_codes)
                )
            except Employee.DoesNotExist:
                queryset = queryset.filter(Q(ma_name=selected_ma) | Q(rm_name=selected_ma))

        if 'rm_manager_name' in filters and filters['rm_manager_name']:
            queryset = queryset.filter(rm_manager_name=filters['rm_manager_name'])
        
        if 'client_name' in filters and filters['client_name']:
            queryset = queryset.filter(client_name=filters['client_name'])
        
        if 'period' in filters and filters['period']:
            queryset = queryset.filter(period=filters['period'])
            
        if 'wire_code' in filters and filters['wire_code']:
            queryset = queryset.filter(wire_code=filters['wire_code'])

        if 'date_from' in filters and filters['date_from']:
            queryset = queryset.filter(transaction_date__gte=filters['date_from'])

        if 'date_to' in filters and filters['date_to']:
            queryset = queryset.filter(transaction_date__lte=filters['date_to'])
        
        # Aggregate brokerage from both sources
        brokerage_total = queryset.filter(
            data_source='BROKERAGE'
        ).aggregate(total=Coalesce(Sum('total_brokerage'), Decimal('0')))['total']
        
        mf_total = queryset.filter(
            data_source='MF'
        ).aggregate(total=Coalesce(Sum('mf_brokerage'), Decimal('0')))['total']
        
        return brokerage_total + mf_total
    
    @staticmethod
    def get_brokerage_by_rm(filters=None):
        """
        Get brokerage breakdown by RM
        
        Returns:
            List of dicts: [{'rm_name': str, 'total_brokerage': Decimal, 'count': int}, ...]
        """
        filters = filters or {}
        queryset = SalesRecord.objects.all()
        
        # Apply filters
        if 'rm_manager_name' in filters and filters['rm_manager_name']:
            queryset = queryset.filter(rm_manager_name=filters['rm_manager_name'])
        if 'period' in filters and filters['period']:
            queryset = queryset.filter(period=filters['period'])
        if 'date_from' in filters and filters['date_from']:
            queryset = queryset.filter(transaction_date__gte=filters['date_from'])
        if 'date_to' in filters and filters['date_to']:
            queryset = queryset.filter(transaction_date__lte=filters['date_to'])
        
        # Group by RM and sum brokerage
        data = []
        rm_names = queryset.values_list('rm_name', flat=True).distinct()
        
        for rm_name in rm_names:
            rm_queryset = queryset.filter(rm_name=rm_name)
            
            brk_total = rm_queryset.filter(
                data_source='BROKERAGE'
            ).aggregate(total=Coalesce(Sum('total_brokerage'), Decimal('0')))['total']
            
            mf_total = rm_queryset.filter(
                data_source='MF'
            ).aggregate(total=Coalesce(Sum('mf_brokerage'), Decimal('0')))['total']
            
            combined = brk_total + mf_total
            count = rm_queryset.count()
            
            data.append({
                'rm_name': rm_name,
                'brokerage_total': float(brk_total),
                'mf_total': float(mf_total),
                'total_brokerage': float(combined),
                'client_count': count,
            })
        
        # Sort by total brokerage descending
        data.sort(key=lambda x: x['total_brokerage'], reverse=True)
        return data
    
    @staticmethod
    def get_brokerage_by_rm_manager(filters=None):
        """
        Get brokerage breakdown by RM Manager
        
        Returns:
            List of dicts: [{'rm_manager_name': str, 'total_brokerage': Decimal, ...}, ...]
        """
        filters = filters or {}
        queryset = SalesRecord.objects.filter(rm_manager_name__isnull=False)
        
        if 'period' in filters and filters['period']:
            queryset = queryset.filter(period=filters['period'])
        if 'date_from' in filters and filters['date_from']:
            queryset = queryset.filter(transaction_date__gte=filters['date_from'])
        if 'date_to' in filters and filters['date_to']:
            queryset = queryset.filter(transaction_date__lte=filters['date_to'])
        
        data = []
        manager_names = queryset.values_list('rm_manager_name', flat=True).distinct()
        
        for mgr_name in manager_names:
            mgr_queryset = queryset.filter(rm_manager_name=mgr_name)
            
            brk_total = mgr_queryset.filter(
                data_source='BROKERAGE'
            ).aggregate(total=Coalesce(Sum('total_brokerage'), Decimal('0')))['total']
            
            mf_total = mgr_queryset.filter(
                data_source='MF'
            ).aggregate(total=Coalesce(Sum('mf_brokerage'), Decimal('0')))['total']
            
            combined = brk_total + mf_total
            
            data.append({
                'rm_manager_name': mgr_name,
                'brokerage_total': float(brk_total),
                'mf_total': float(mf_total),
                'total_brokerage': float(combined),
                'rm_count': mgr_queryset.values('rm_name').distinct().count(),
                'client_count': mgr_queryset.count(),
            })
        
        data.sort(key=lambda x: x['total_brokerage'], reverse=True)
        return data
    
    @staticmethod
    def get_brokerage_by_client(rm_name=None, limit=50):
        """
        Get top clients by brokerage
        
        Args:
            rm_name: Optional RM filter
            limit: Number of top clients to return
        
        Returns:
            List of dicts: [{'client_name': str, 'rm_name': str, 'total_brokerage': Decimal}, ...]
        """
        queryset = SalesRecord.objects.all()
        
        if rm_name:
            queryset = queryset.filter(rm_name=rm_name)
        
        data = []
        clients = queryset.values('client_name', 'rm_name').distinct()
        
        for client in clients:
            client_queryset = queryset.filter(
                client_name=client['client_name'],
                rm_name=client['rm_name']
            )
            
            brk_total = client_queryset.filter(
                data_source='BROKERAGE'
            ).aggregate(total=Coalesce(Sum('total_brokerage'), Decimal('0')))['total']
            
            mf_total = client_queryset.filter(
                data_source='MF'
            ).aggregate(total=Coalesce(Sum('mf_brokerage'), Decimal('0')))['total']
            
            combined = brk_total + mf_total
            
            data.append({
                'client_name': client['client_name'],
                'rm_name': client['rm_name'],
                'brokerage_total': float(brk_total),
                'mf_total': float(mf_total),
                'total_brokerage': float(combined),
            })
        
        # Sort by total brokerage and limit
        data.sort(key=lambda x: x['total_brokerage'], reverse=True)
        return data[:limit]
    
    @staticmethod
    def get_period_summary(period=None):
        """
        Get summary statistics for a period
        
        Args:
            period: Optional period filter (e.g., 'Jan 2026')
        
        Returns:
            Dict with summary stats
        """
        queryset = SalesRecord.objects.all()
        if period:
            queryset = queryset.filter(period=period)
        
        brk_total = queryset.filter(
            data_source='BROKERAGE'
        ).aggregate(total=Coalesce(Sum('total_brokerage'), Decimal('0')))['total']
        
        mf_total = queryset.filter(
            data_source='MF'
        ).aggregate(total=Coalesce(Sum('mf_brokerage'), Decimal('0')))['total']
        
        return {
            'period': period or 'All Time',
            'brokerage_total': float(brk_total),
            'mf_total': float(mf_total),
            'combined_total': float(brk_total + mf_total),
            'unique_clients': queryset.values('client_name').distinct().count(),
            'unique_rms': queryset.values('rm_name').distinct().count(),
            'unique_managers': queryset.filter(rm_manager_name__isnull=False).values('rm_manager_name').distinct().count(),
            'total_records': queryset.count(),
        }
    
    @staticmethod
    def get_available_periods():
        """Get list of all available periods in data"""
        periods = SalesRecord.objects.filter(
            period__isnull=False
        ).values_list('period', flat=True).distinct().order_by('-period')
        return list(periods)
    
    @staticmethod
    def get_turnover_metrics(filters=None):
        """
        Get turnover breakdown (Equity Cash, Equity FnO, Total)
        
        Returns:
            Dict with turnover statistics
        """
        filters = filters or {}
        queryset = SalesRecord.objects.filter(data_source='BROKERAGE')
        
        if 'rm_name' in filters and filters['rm_name']:
            queryset = queryset.filter(rm_name=filters['rm_name'])
        if 'period' in filters and filters['period']:
            queryset = queryset.filter(period=filters['period'])
        if 'date_from' in filters and filters['date_from']:
            queryset = queryset.filter(transaction_date__gte=filters['date_from'])
        if 'date_to' in filters and filters['date_to']:
            queryset = queryset.filter(transaction_date__lte=filters['date_to'])
        
        agg = queryset.aggregate(
            total_equity_cash=Coalesce(Sum('total_equity_cash_turnover'), Decimal('0')),
            total_equity_fno=Coalesce(Sum('total_equity_fno_turnover'), Decimal('0')),
            total_turnover=Coalesce(Sum('total_turnover'), Decimal('0')),
        )
        
        return {
            'equity_cash_turnover': float(agg['total_equity_cash']),
            'equity_fno_turnover': float(agg['total_equity_fno']),
            'total_turnover': float(agg['total_turnover']),
        }


class DataQuality:
    """Data quality checks and validation"""
    
    @staticmethod
    def get_data_summary():
        """Get data quality summary"""
        summary = {
            'total_records': SalesRecord.objects.count(),
            'total_employees': Employee.objects.count(),
            'total_clients': Client.objects.count(),
            'records_with_nulls': SalesRecord.objects.filter(
                Q(rm_name__isnull=True) | Q(client_name__isnull=True)
            ).count(),
            'orphaned_clients': SalesRecord.objects.filter(
                client__isnull=True
            ).count(),
            'periods': SalesRecord.objects.filter(
                period__isnull=False
            ).values_list('period', flat=True).distinct().count(),
        }
        return summary
    
    @staticmethod
    def get_rm_coverage():
        """Check if all RMs in SalesRecord exist in Employee table"""
        sales_rms = set(SalesRecord.objects.values_list('rm_name', flat=True).distinct())
        employee_rms = set(Employee.objects.values_list('rm_name', flat=True).distinct())
        
        unmapped_rms = sales_rms - employee_rms
        
        return {
            'total_sales_rms': len(sales_rms),
            'total_employee_rms': len(employee_rms),
            'unmapped_rms': list(unmapped_rms),
            'unmapped_count': len(unmapped_rms),
        }
