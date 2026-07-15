"""
Employee Hierarchy & Access Control Module
Provides hierarchy traversal and role-based access control
"""

from django.db.models import Q
from .models import Employee, UserProfile, SalesRecord


class EmployeeHierarchy:
    """Manage and traverse employee hierarchy"""
    
    @staticmethod
    def get_hierarchy_tree(employee, include_inactive=False):
        """
        Get organizational tree with this employee at root
        
        Returns nested dict structure:
        {
            'employee': Employee,
            'subordinates': [
                {'employee': Employee, 'subordinates': [...]},
                ...
            ]
        }
        """
        query = employee.subordinates.all()
        if not include_inactive:
            query = query.filter(is_active=True)
        
        return {
            'employee': employee,
            'subordinates': [
                EmployeeHierarchy.get_hierarchy_tree(sub, include_inactive)
                for sub in query
            ]
        }
    
    @staticmethod
    def get_top_level_employees():
        """Get all top-level employees (no manager)"""
        return Employee.objects.filter(manager__isnull=True, is_active=True)
    
    @staticmethod
    def get_full_organization():
        """Get organizational tree starting from all top-level employees"""
        return [
            EmployeeHierarchy.get_hierarchy_tree(emp)
            for emp in EmployeeHierarchy.get_top_level_employees()
        ]
    
    @staticmethod
    def get_reporting_chain_string(employee):
        """Get readable reporting chain (e.g., 'Anil -> Sharma -> Leader')"""
        return employee.reporting_chain
    
    @staticmethod
    def get_manager_at_level(employee, levels_up=1):
        """
        Get manager at specified levels up in hierarchy
        
        Args:
            employee: Employee object
            levels_up: How many levels to go up (1=direct manager, 2=manager's manager, etc)
        
        Returns:
            Employee object or None
        """
        current = employee
        for _ in range(levels_up):
            if current.manager:
                current = current.manager
            else:
                return None
        return current


class AccessControl:
    """Role-based access control for sales data"""
    
    @staticmethod
    def get_accessible_rms(user_profile):
        """
        Get RMs that this user can view data for
        
        Returns:
        - Leaders: All RMs
        - Managers: Own subordinates + themselves
        - RMs: Only themselves
        """
        if user_profile.is_leader:
            # Leaders see all
            return Employee.objects.filter(is_active=True).values_list('rm_name', flat=True)
        
        if user_profile.is_manager:
            # Managers see their team
            accessible_rms = []
            
            # Add themselves
            if user_profile.employee:
                accessible_rms.append(user_profile.employee.rm_name)
            
            # Add all subordinates
            for subordinate in user_profile.employee.get_subordinates(recursive=True):
                if subordinate.is_active:
                    accessible_rms.append(subordinate.rm_name)
            
            return accessible_rms
        
        # RMs see only themselves
        if user_profile.employee:
            return [user_profile.employee.rm_name]
        
        return []
    
    @staticmethod
    def get_accessible_sales_records(user_profile):
        """
        Get SalesRecords this user can view based on role
        """
        accessible_rms = AccessControl.get_accessible_rms(user_profile)
        return SalesRecord.objects.filter(rm_name__in=accessible_rms)
    
    @staticmethod
    def can_view_rm_data(user_profile, rm_name):
        """Check if user can view data for specific RM"""
        accessible = AccessControl.get_accessible_rms(user_profile)
        return rm_name in accessible
    
    @staticmethod
    def can_manage_user(manager_profile, target_profile):
        """
        Check if manager_profile can manage (see reports, edit) target_profile
        
        Returns True if:
        - Manager is a Leader
        - Manager is target's direct manager
        - Manager is higher in hierarchy
        """
        if manager_profile.is_leader:
            return True
        
        if not manager_profile.employee or not target_profile.employee:
            return False
        
        # Check if target is in manager's subordinates
        if target_profile.employee in manager_profile.employee.get_subordinates(recursive=True):
            return True
        
        return False


class HierarchyAnalytics:
    """Analytics based on organizational hierarchy"""
    
    @staticmethod
    def get_team_brokerage(employee, include_subordinates=True):
        """
        Get total brokerage for employee and optionally their team
        """
        from .analytics import BrokerageAnalytics
        
        # Get this employee's brokerage
        employee_total = BrokerageAnalytics.get_total_brokerage({
            'rm_name': employee.rm_name
        })
        
        if not include_subordinates:
            return employee_total
        
        # Add subordinates' brokerage
        team_total = employee_total
        for subordinate in employee.get_subordinates(recursive=True):
            if subordinate.is_active:
                sub_total = BrokerageAnalytics.get_total_brokerage({
                    'rm_name': subordinate.rm_name
                })
                team_total += sub_total
        
        return team_total
    
    @staticmethod
    def get_team_metrics(employee):
        """Get comprehensive metrics for employee's team"""
        from django.db.models import Sum, Count
        from .analytics import BrokerageAnalytics
        
        # Get all RMs in this org unit
        org_unit = [employee] + employee.get_subordinates(recursive=True)
        rm_names = [emp.rm_name for emp in org_unit if emp.is_active]
        
        # Get sales records
        records = SalesRecord.objects.filter(rm_name__in=rm_names)
        
        # Calculate metrics
        brk_agg = records.filter(data_source='BROKERAGE').aggregate(
            total=Sum('total_brokerage')
        )
        mf_agg = records.filter(data_source='MF').aggregate(
            total=Sum('mf_brokerage')
        )
        
        brk_total = float(brk_agg['total'] or 0)
        mf_total = float(mf_agg['total'] or 0)
        
        return {
            'employee': employee.rm_name,
            'org_unit_size': len(org_unit),
            'active_members': len([e for e in org_unit if e.is_active]),
            'brokerage_total': brk_total,
            'mf_total': mf_total,
            'combined_total': brk_total + mf_total,
            'client_count': records.values('client_name').distinct().count(),
            'record_count': records.count(),
        }
    
    @staticmethod
    def get_hierarchy_comparison():
        """Get metrics for all top-level employees for comparison"""
        metrics = []
        for employee in EmployeeHierarchy.get_top_level_employees():
            metrics.append(HierarchyAnalytics.get_team_metrics(employee))
        
        # Sort by combined_total descending
        metrics.sort(key=lambda x: x['combined_total'], reverse=True)
        return metrics
