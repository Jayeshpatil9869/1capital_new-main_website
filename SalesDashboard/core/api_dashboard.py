from rest_framework import permissions
from rest_framework.response import Response
from rest_framework.views import APIView

from .analytics import BrokerageAnalytics
from .models import SalesRecord, UserProfile, Employee
from .views import sanitize_for_json, build_dashboard_context


class DashboardSummaryView(APIView):
  """
  Returns aggregated dashboard metrics and chart data similar to `dashboard_view`,
  but as JSON for the React frontend.
  """

  permission_classes = (permissions.IsAuthenticated,)

  def get(self, request):
      user = request.user
      try:
          user_profile = UserProfile.objects.get(user=user)
          user_role = user_profile.role
      except UserProfile.DoesNotExist:
          user_profile = None
          user_role = "R"

      selected_rm = request.query_params.get("rm", "").strip()
      selected_ma = request.query_params.get("ma", "").strip()
      selected_manager = request.query_params.get("manager", "").strip()
      selected_period = request.query_params.get("period", "").strip()

      records_queryset = SalesRecord.objects.all()

      if user_role == "L":
          pass
      elif user_role == "M":
          pass
      else:
          user_full_name = user.get_full_name() or user.username.replace("_", " ").title()
          records_queryset = records_queryset.filter(
              rm_name=user_full_name
          ) | records_queryset.filter(ma_name=user_full_name)

      if selected_manager:
          try:
              manager_emp = Employee.objects.get(rm_name=selected_manager)

              def get_team_rm_names(emp):
                  names = [emp.rm_name] if emp.rm_name else []
                  for subordinate in Employee.objects.filter(manager=emp):
                      names.extend(get_team_rm_names(subordinate))
                  return names

              subordinate_rms = get_team_rm_names(manager_emp)
              records_queryset = records_queryset.filter(rm_name__in=subordinate_rms)
          except Employee.DoesNotExist:
              pass

      if selected_rm:
          records_queryset = records_queryset.filter(rm_name=selected_rm)

      if selected_ma:
          records_queryset = records_queryset.filter(ma_name=selected_ma)

      filters = {
          "rm_name": selected_rm or None,
          "ma_name": selected_ma or None,
          "period": selected_period or None,
      }

      total_brokerage = BrokerageAnalytics.get_total_brokerage(filters)

      from django.db.models import Sum

      totals = records_queryset.aggregate(
          total_brokerage=Sum("total_brokerage"),
          total_mf_brokerage=Sum("mf_brokerage"),
          total_equity_cash=Sum("total_equity_cash_turnover"),
          total_equity_fno=Sum("total_equity_fno_turnover"),
          total_turnover=Sum("total_turnover"),
      )
      totals = {k: (v or 0) for k, v in totals.items()}
      totals["combined_total_brokerage"] = total_brokerage

      return Response(
          {
              "user_role": user_role,
              "filters": {
                  "rm": selected_rm,
                  "ma": selected_ma,
                  "manager": selected_manager,
                  "period": selected_period,
              },
              "totals": sanitize_for_json(totals),
          }
      )


class DashboardFullView(APIView):
  """
  Returns the full data used by `core/templates/dashboard.html` so the React SPA
  can replicate the dashboard exactly (filters, totals, chart series, records).
  """

  permission_classes = (permissions.IsAuthenticated,)

  def get(self, request):
      ctx = build_dashboard_context(user=request.user, params=request.GET)

      records = []
      for r in ctx["records"]:
          records.append(
              {
                  "client_name": r.client_name,
                  "rm_name": r.rm_name,
                  "ma_name": r.ma_name,
                  "total_brokerage": float(r.total_brokerage or 0),
                  "total_equity_cash_turnover": float(r.total_equity_cash_turnover or 0),
                  "total_equity_fno_turnover": float(r.total_equity_fno_turnover or 0),
                  "total_turnover": float(r.total_turnover or 0),
              }
          )

      return Response(
          {
              "title": ctx.get("title", "Sales Dashboard"),
              "user": {
                  "username": request.user.username,
                  "full_name": request.user.get_full_name() or "User",
              },
              "filters": {
                  "selected_rm": ctx.get("selected_rm", ""),
                  "selected_ma": ctx.get("selected_ma", ""),
                  "selected_manager": ctx.get("selected_manager", ""),
                  "selected_date_from": ctx.get("selected_date_from", ""),
                  "selected_date_to": ctx.get("selected_date_to", ""),
              },
              "options": {
                  "all_rms": ctx.get("all_rms", []),
                  "all_mas": ctx.get("all_mas", []),
                  "all_managers": ctx.get("all_managers", []),
              },
              "totals": ctx.get("totals", {}),
              "chart_data": ctx.get("chart_data", {}),
              "records": records,
          }
      )

