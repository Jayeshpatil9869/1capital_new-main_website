from django.db import models
from django.contrib.auth.models import User
from decimal import Decimal

# --- Role Definitions ---
# L=Leader, M=Manager, R=RM/MA
ROLES = (
    ('L', 'Leader'),
    ('M', 'Manager'),
    ('R', 'RM / MA'),
)

class UserProfile(models.Model):
    """
    Extends the default User model to add role, reporting hierarchy, and RM dimension linkage.
    
    Provides:
    - Role-based access control (Leader, Manager, RM/MA)
    - Manager hierarchy via self-join (reporting_to)
    - Link to Employee dimension for RM master data
    - Password management via Django User model
    """
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    role = models.CharField(max_length=1, choices=ROLES, default='R')
    
    # Link to RM dimension - connects user to their employee record
    employee = models.OneToOneField(
        'Employee',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='user_profile',
        help_text='Link to Employee dimension (RM master data)'
    )
    
    # Self-referential ForeignKey: links this user to the person they report to
    # Creates manager hierarchy: RM -> Manager -> Leader
    reporting_to = models.ForeignKey(
        'self', 
        on_delete=models.SET_NULL, 
        null=True, 
        blank=True,
        related_name='direct_reports',
        help_text='Manager this user reports to (creates hierarchy)'
    )
    
    # Additional profile fields
    wire_code = models.CharField(
        max_length=50, 
        null=True, 
        blank=True,
        db_index=True,
        help_text='Wire/Employee code for matching with data'
    )
    
    is_active = models.BooleanField(default=True, help_text='User can login if True')
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        db_table = 'user_profile'
        indexes = [
            models.Index(fields=['wire_code']),
            models.Index(fields=['role']),
            models.Index(fields=['reporting_to']),
        ]

    def __str__(self):
        return f"{self.user.username} ({self.get_role_display()}) - {self.employee.rm_name if self.employee else 'No RM'}"
    
    @property
    def role_label(self):
        return dict(ROLES).get(self.role, 'Unknown')
        
    @property
    def is_leader(self):
        """Check if user is a Leader"""
        return self.role == 'L'
    
    @property
    def is_manager(self):
        """Check if user is a Manager"""
        return self.role == 'M'
    
    @property
    def is_rm(self):
        """Check if user is an RM/MA"""
        return self.role == 'R'
    
    @property
    def manager(self):
        """Get this user's manager"""
        return self.reporting_to
    
    def get_direct_reports(self):
        """Get all users who report directly to this user"""
        return self.direct_reports.filter(is_active=True)
    
    def get_team_members(self):
        """Get all team members (direct + indirect reports)"""
        team = []
        for direct_report in self.get_direct_reports():
            team.append(direct_report)
            team.extend(direct_report.get_team_members())
        return team
    
    def can_view_data(self, rm_name, user_rm_name=None):
        """
        Check if this user can view data for a given RM
        
        Returns True if:
        - User is Leader (can see all)
        - User is the RM themselves
        - User is Manager of that RM
        - User is higher in hierarchy
        """
        if self.is_leader:
            return True
        if self.employee and self.employee.rm_name == rm_name:
            return True
        if user_rm_name == rm_name and self.employee:
            return True
        # Check if RM is in this user's team
        for team_member in self.get_team_members():
            if team_member.employee and team_member.employee.rm_name == rm_name:
                return True
        return False


# --- Dimension Tables ---
class Employee(models.Model):
    """
    Employee dimension - stores RM/RM Manager/MA details from Employee_dim folder
    
    Self-join structure:
    - RMs report to Managers (via manager_id FK)
    - Managers report to Leaders (via manager_id FK)
    - Creates organizational hierarchy
    """
    
    pan_number = models.CharField("PAN Number", max_length=20, unique=True, primary_key=True)
    rm_name = models.CharField(max_length=255, db_index=True)
    wire_code = models.CharField(max_length=50, null=True, blank=True, db_index=True)
    designation = models.CharField(max_length=100, null=True, blank=True)  # RM, Manager, Leader
    
    # Self-referential FK - creates manager hierarchy
    manager = models.ForeignKey(
        'self',
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name='subordinates',
        db_index=True,
        help_text='Manager this employee reports to (self-join hierarchy)'
    )
    
    # Legacy fields for data loading compatibility
    rm_manager_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    ma_name = models.CharField(max_length=255, null=True, blank=True)
    
    # Contact information
    email = models.EmailField(null=True, blank=True, db_index=True)
    phone = models.CharField(max_length=20, null=True, blank=True)
    
    # Status
    is_active = models.BooleanField(default=True, db_index=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'employee_dimension'
        indexes = [
            models.Index(fields=['rm_name']),
            models.Index(fields=['manager']),
            models.Index(fields=['email']),
            models.Index(fields=['is_active']),
            models.Index(fields=['wire_code']),
        ]
    
    def __str__(self):
        wire_codes = self.wire_codes.all()
        wire_str = self.wire_code or (", ".join([wc.wire_code for wc in wire_codes]) if wire_codes else "No Wire Code")
        if self.manager:
            return f"{self.rm_name} ({wire_str}) -> {self.manager.rm_name}"
        return f"{self.rm_name} ({wire_str}) [Top]"
    
    @property
    def get_manager(self):
        """Get direct manager"""
        return self.manager
    
    @property
    def get_manager_name(self):
        """Get direct manager's name"""
        return self.manager.rm_name if self.manager else None
    
    def get_all_superiors(self):
        """
        Get all superiors in hierarchy (chain of command)
        Returns list of Employee objects from direct manager up to top
        """
        superiors = []
        current = self.manager
        while current:
            superiors.append(current)
            current = current.manager
        return superiors
    
    def get_subordinates(self, recursive=False):
        """
        Get all direct subordinates
        
        Args:
            recursive: If True, get all subordinates recursively
        """
        if not recursive:
            return list(self.subordinates.filter(is_active=True))
        
        subordinates = []
        for direct_sub in self.subordinates.filter(is_active=True):
            subordinates.append(direct_sub)
            subordinates.extend(direct_sub.get_subordinates(recursive=True))
        return subordinates
    
    def get_org_unit_count(self):
        """Get count of all people in this org unit (including self)"""
        return 1 + len(self.get_subordinates(recursive=True))
    
    @property
    def is_top_level(self):
        """Check if this is a top-level employee (no manager)"""
        return self.manager is None
    
    @property
    def reporting_chain(self):
        """Get string representation of reporting chain"""
        chain = [self.rm_name]
        for superior in self.get_all_superiors():
            chain.append(superior.rm_name)
        return " -> ".join(chain)

class EmployeeWireCode(models.Model):
    """Stores multiple wire codes associated with an employee"""
    employee = models.ForeignKey(Employee, on_delete=models.CASCADE, related_name='wire_codes')
    wire_code = models.CharField(max_length=50, unique=True, db_index=True)

    class Meta:
        db_table = 'employee_wire_code'

    def __str__(self):
        return f"{self.wire_code} ({self.employee.rm_name})"


class Client(models.Model):
    """Client dimension - stores client details and their assigned RM from Client_dim folder"""
    
    client_code = models.CharField(max_length=50, unique=True, primary_key=True)
    client_name = models.CharField(max_length=255, db_index=True)
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='clients')
    wire_code = models.CharField(max_length=50, null=True, blank=True, db_index=True)
    rm_name = models.CharField(max_length=255, db_index=True)
    ma_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    rm_manager_name = models.CharField(max_length=255, null=True, blank=True)
    
    # New fields
    client_pan = models.CharField(max_length=20, null=True, blank=True, db_index=True)
    rm_pan = models.CharField(max_length=20, null=True, blank=True)
    aum = models.DecimalField(max_digits=20, decimal_places=2, default=0)
    
    # Client metadata
    client_type = models.CharField(max_length=50, null=True, blank=True)  # Individual/HUF/Company etc
    city = models.CharField(max_length=100, null=True, blank=True)
    state = models.CharField(max_length=100, null=True, blank=True)
    
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'client_dimension'
        indexes = [
            models.Index(fields=['client_name']),
            models.Index(fields=['rm_name']),
            models.Index(fields=['wire_code']),
            models.Index(fields=['employee']),
        ]
    
    def __str__(self):
        return f"{self.client_name} ({self.client_code})"

class SalesRecord(models.Model):
    """Fact table for sales/brokerage data loaded from brokerage_fact and MF_fact folders"""
    
    # Foreign Keys to dimensions
    employee = models.ForeignKey(Employee, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_records')
    client = models.ForeignKey(Client, on_delete=models.SET_NULL, null=True, blank=True, related_name='sales_records')
    
    # Hierarchy denormalization (for query performance)
    rm_manager_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    rm_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    ma_name = models.CharField(max_length=255, null=True, blank=True)
    wire_code = models.CharField(max_length=50, null=True, blank=True)
    client_name = models.CharField(max_length=255, null=True, blank=True, db_index=True)
    
    # Financial metrics - Brokerage Data
    total_brokerage = models.DecimalField(max_digits=15, decimal_places=2, default=0, db_index=True)
    cash_delivery = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    cash_intraday = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    equity_cash_delivery_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    equity_futures_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    equity_options_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    equity_cash_intraday_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_equity_cash_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_equity_fno_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_equity_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    total_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Financial metrics - MF Data
    mf_brokerage = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    mf_turnover = models.DecimalField(max_digits=15, decimal_places=2, default=0)
    
    # Date filtering
    transaction_date = models.DateField(null=True, blank=True, db_index=True)
    
    # Metadata
    data_source = models.CharField(max_length=50, choices=[
        ('BROKERAGE', 'Brokerage Fact'),
        ('MF', 'Mutual Fund Fact'),
    ], default='BROKERAGE')
    period = models.CharField(max_length=20, null=True, blank=True)  # e.g., 'Jan 2026', 'Feb 2026'
    file_name = models.CharField(max_length=255, null=True, blank=True)  # Source file
    loaded_at = models.DateTimeField(auto_now_add=True, null=True)
    
    class Meta:
        db_table = 'sales_record'
        indexes = [
            models.Index(fields=['rm_name', 'total_brokerage']),
            models.Index(fields=['client_name', 'rm_name']),
            models.Index(fields=['period', 'data_source']),
        ]
    
    def __str__(self):
        return f"{self.client_name} - {self.rm_name} (\u20b9{self.total_brokerage})"
