from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status
from django.conf import settings
from .models import Income
from .models import Expense
from .models import MonthlyBudget
from django.core.exceptions import ObjectDoesNotExist
from django.shortcuts import get_object_or_404
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from django.db.models import Sum
from django.shortcuts import render
from django.http import JsonResponse
from django.core.serializers import serialize
from rest_framework.decorators import api_view
from django.db.models.functions import TruncMonth
from datetime import datetime, timedelta
from django.db import DatabaseError
from django.utils import timezone
from decimal import InvalidOperation


User = get_user_model()
class SetMonthlyBudgetView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        user = get_object_or_404(User, id=user_id)
        title = request.data.get('title')
        category = request.data.get('category', 'expenses')
        amount = request.data.get('amount')
        month = str(request.data.get('month')).zfill(2)  # Month (01 to 12)
        year = request.data.get('year')  # Year (e.g., 2025)
        description = request.data.get('description')  # Description of the budget (optional)

        missing_fields = []
        
        if not title:
            missing_fields.append('Title')
        if not category:
            missing_fields.append('Category')
        if not amount:
            missing_fields.append('Amount')
        if not month:
            missing_fields.append('Month')
        if not year:
            missing_fields.append('Year')

        if missing_fields:
            return Response({'error': f'Missing required fields: {", ".join(missing_fields)}'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure that the budget for the user is set for the given month and year
        try:
            # If description is None, it will be omitted from the update_or_create
            budget, created = MonthlyBudget.objects.update_or_create(
                user=user,
                title=title,
                category=category,
                month=month,
                year=year,
                defaults={'amount': amount, 'description': description}  # Include description only if provided
            )
        except DatabaseError as e:
            return Response({'error': str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

        if created:
            return Response({'message': 'Monthly budget set successfully'}, status=status.HTTP_201_CREATED)
        else:
            return Response({'message': 'Monthly budget updated successfully'}, status=status.HTTP_200_OK)

class AddIncomeView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        amount = request.data.get('amount')
        date = request.data.get('date')
        title = request.data.get('title', 'Untitled')  # default to 'Untitled' if not provided
        description = request.data.get('description')  # can be None

        if not all([user_id, amount, date]):
            return Response({'error': 'user_id, income, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            income = Income.objects.create(
                user=user,
                income=amount,
                date=date,
                title=title,
                description=description
            )
            return Response({'message': 'Income added successfully', 'income_id': income.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class AddExpenseView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        amount = request.data.get('amount')
        category = request.data.get('category', 'expenses')  # default to 'expenses' if not provided
        date = request.data.get('date')
        title = request.data.get('title', 'Untitled')  # default to 'Untitled' if not provided
        description = request.data.get('description')  # can be None

        if not all([user_id, amount, date]):
            return Response({'error': 'user_id, expense, and date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        try:
            expense = Expense.objects.create(
                user=user,
                expense=amount,
                category=category,
                date=date,
                title=title,
                description=description
            )
            return Response({'message': 'Expense added successfully', 'expense_id': expense.id}, status=status.HTTP_201_CREATED)
        except Exception as e:
            return Response({'error': str(e)}, status=status.HTTP_400_BAD_REQUEST)

class MonthlyBudgetCalculatorView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        month = str(request.data.get('month')).zfill(2)  # Ensure two digits
        year = request.data.get('year')

        if not user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not month or not year:
            return Response({'error': 'month and year are required.'}, status=status.HTTP_400_BAD_REQUEST)

        # Ensure the month is valid (1-12)
        if not (1 <= int(month) <= 12):
            return Response({'error': 'Invalid month. It should be between 1 and 12.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        # Sum all monthly budget entries for the given month and year
        total_budget = MonthlyBudget.objects.filter(
            user=user,
            month=month,
            year=year
        ).aggregate(total=Sum('amount'))['total'] or 0

        # Return the total budget for the specified month and year
        return Response({
            'total_budget': float(total_budget),
        }, status=status.HTTP_200_OK)

class BudgetCalculatorView(APIView):
    def post(self, request):
        user_id = request.data.get('user_id')
        start_date = request.data.get('start_date')
        end_date = request.data.get('end_date')

        if not user_id:
            return Response({'error': 'user_id is required.'}, status=status.HTTP_400_BAD_REQUEST)

        if not start_date or not end_date:
            return Response({'error': 'start_date and end_date are required.'}, status=status.HTTP_400_BAD_REQUEST)

        user = get_object_or_404(User, id=user_id)

        # Always use two-digit month string for filtering
        month = str(datetime.strptime(start_date, '%Y-%m-%d').month).zfill(2)
        year = datetime.strptime(start_date, '%Y-%m-%d').year

        # Get all categories from MonthlyBudget
        budget_categories = MonthlyBudget.objects.filter(
            user=user,
            month=month,
            year=year
        ).values('category').distinct()

        category_budgets = {}
        category_expenses = {}
        category_alerts = {}

        # Calculate budget and expenses for each category
        for category in budget_categories:
            category_name = category['category']
            
            # Get budget for this category
            budget_amount = MonthlyBudget.objects.filter(
                user=user,
                category=category_name,
                month=month,
                year=year
            ).aggregate(total=Sum('amount'))['total'] or 0

            # Get expenses for this category
            expense_amount = Expense.objects.filter(
                user=user,
                category=category_name,
                date__range=[start_date, end_date]
            ).aggregate(total=Sum('expense'))['total'] or 0

            category_budgets[category_name] = float(budget_amount)
            category_expenses[category_name] = float(expense_amount)

            # Calculate budget usage percentage
            if budget_amount > 0:
                usage_percentage = (expense_amount / budget_amount) * 100
                if usage_percentage >= 100:
                    category_alerts[category_name] = {
                        'status': 'exceeded',
                        'percentage': usage_percentage,
                        'remaining': float(budget_amount - expense_amount)
                    }
                elif usage_percentage >= 80:
                    category_alerts[category_name] = {
                        'status': 'warning',
                        'percentage': usage_percentage,
                        'remaining': float(budget_amount - expense_amount)
                    }

        # Calculate overall totals
        total_income = Income.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).aggregate(total=Sum('income'))['total'] or 0

        total_expense = Expense.objects.filter(
            user=user,
            date__range=[start_date, end_date]
        ).aggregate(total=Sum('expense'))['total'] or 0

        total_budget = sum(category_budgets.values())
        budget = total_income - total_expense

        return Response({
            'total_income': float(total_income),
            'total_expense': float(total_expense),
            'budget': float(budget),
            'category_budgets': category_budgets,
            'category_expenses': category_expenses,
            'category_alerts': category_alerts
        }, status=status.HTTP_200_OK)
        
def finance_details(request, user_id):
    # Get query parameters
    start_date = request.GET.get('start_date')
    end_date = request.GET.get('end_date')
    category = request.GET.get('category')  # New category filter
    filter_type = request.GET.get('type', '')  # Filter by income or expense

    filter_type = filter_type.lower()

    # Fetch incomes and expenses for the given user
    incomes = Income.objects.filter(user_id=user_id)
    expenses = Expense.objects.filter(user_id=user_id)

    # Apply date range filter if provided
    if start_date and end_date:
        incomes = incomes.filter(date__range=[start_date, end_date])
        expenses = expenses.filter(date__range=[start_date, end_date])

    # Apply category filter if provided
    if category and category != 'all':  # 'all' means no category filter
        incomes = incomes.filter(category=category)
        expenses = expenses.filter(category=category)

    # Combine incomes and expenses
    combined_data = []

    # Add income data if filter is income or if no filter is set
    if filter_type in ['', 'income']:
        for income in incomes:
            combined_data.append({
                'id': income.id,
                'type': 'income',
                'category': income.category,
                'amount': float(income.income),
                'title': income.title,
                'description': income.description,
                'date': income.date.isoformat(),
            })

    # Add expense data if filter is expense or if no filter is set
    if filter_type in ['', 'expense']:
        for expense in expenses:
            combined_data.append({
                'id': expense.id,
                'type': 'expense',
                'category': expense.category,
                'amount': float(expense.expense) * -1,
                'title': expense.title,
                'description': expense.description,
                'date': expense.date.isoformat(),
            })

    # Sort by date ascending
    combined_data.sort(key=lambda x: x['date'])

    return JsonResponse({'finance': combined_data})

def budget_details(request, user_id):
    try:
        # Get filters from query parameters
        category_filter = request.GET.get('category', None)
        month_year_filter = request.GET.get('month_year', None)

        # Print the filters received in the request
        print(f"Received Filters: category={category_filter}, month_year={month_year_filter}")

        # Start with base queryset
        budgets = MonthlyBudget.objects.filter(user_id=user_id)

        # Apply category filter if present
        if category_filter:
            budgets = budgets.filter(category=category_filter)

        # Apply month-year filter if present
        if month_year_filter:
            try:
                # Split the month_year filter into month and year
                month_str, year_str = month_year_filter.split('-')
                month = str(month_str)  # month should remain as a string (since it's stored as CharField in the model)
                year = int(year_str)

                # Print out the filters being applied to the queryset
                print(f"Applying Filter: month={month}, year={year}")

                # Perform the filtering with month as a string and year as integer
                budgets = budgets.filter(month=month, year=year)

            except (ValueError, TypeError):
                print(f"Invalid month_year parameter: {month_year_filter}")

        # Print the final queryset
        print(f"Final Queryset: {budgets.query}")

        # Serialize data
        serialized_data = []
        for budget in budgets:
            try:
                amount = str(budget.amount)
            except InvalidOperation:
                amount = 'Invalid Amount'

            serialized_data.append({
                'id': budget.id,
                'month': budget.month,
                'category': budget.category,
                'title': budget.title,
                'year': budget.year,
                'amount': amount,
                'description': budget.description,
            })

        return JsonResponse({'budget': serialized_data}, status=200)

    except Exception as e:
        print(f"Error fetching budget data for user {user_id}: {e}")
        return JsonResponse({'error': 'Internal server error.'}, status=500)




@api_view(['PATCH'])
def update_finance_entry(request, user_id, entry_id):
    entry_type = request.data.get('type')
    new_title = request.data.get('title')
    new_description = request.data.get('description')
    new_category = request.data.get('category')
    new_amount = request.data.get('amount')

    if not entry_type:
        return JsonResponse({'error': 'Type (income or expense) is required.'}, status=status.HTTP_400_BAD_REQUEST)

    if not any([new_title, new_description, new_category, new_amount]):
        return JsonResponse({'error': 'At least one field (title, description, category, amount) is required for update.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if entry_type == 'income':
            entry = Income.objects.get(id=entry_id, user_id=user_id)
            if new_title:
                entry.title = new_title
            if new_description:
                entry.description = new_description
            if new_category:
                entry.category = new_category
            if new_amount is not None:
                entry.income = new_amount
            entry.save()
        elif entry_type == 'expense':
            entry = Expense.objects.get(id=entry_id, user_id=user_id)
            if new_title:
                entry.title = new_title
            if new_description:
                entry.description = new_description
            if new_category:
                entry.category = new_category
            if new_amount is not None:
                entry.expense = new_amount
            entry.save()
        else:
            return JsonResponse({'error': 'Invalid type. Must be "income" or "expense".'}, status=status.HTTP_400_BAD_REQUEST)

        return JsonResponse({'message': f'{entry_type.capitalize()} entry updated successfully.'}, status=status.HTTP_200_OK)

    except (Income.DoesNotExist, Expense.DoesNotExist):
        return JsonResponse({'error': f'{entry_type.capitalize()} entry not found.'}, status=status.HTTP_404_NOT_FOUND)
    
@api_view(['PATCH'])
def update_budget_entry(request, user_id, entry_id):
    new_title = request.data.get('title')
    new_category = request.data.get('category')
    new_description = request.data.get('description')
    new_amount = request.data.get('amount')

    if not any([new_title, new_description, new_amount, new_category]):
        return JsonResponse(
            {'error': 'At least one field (title, description, amount, category) is required for update.'},
            status=status.HTTP_400_BAD_REQUEST
        )

    try:
        entry = MonthlyBudget.objects.get(id=entry_id, user_id=user_id)

        if new_title:
            entry.title = new_title
        if new_description:
            entry.description = new_description
        if new_category:
            entry.category = new_category
        if new_amount is not None:
            entry.amount = new_amount
        

        entry.save()

        return JsonResponse({'message': 'Budget entry updated successfully.'}, status=status.HTTP_200_OK)

    except MonthlyBudget.DoesNotExist:
        return JsonResponse({'error': 'Budget entry not found.'}, status=status.HTTP_404_NOT_FOUND)

@api_view(['DELETE'])
def delete_finance_entry(request, user_id, entry_id):
    entry_type = request.data.get('type')

    if not entry_type:
        return JsonResponse({'error': 'Type (income or expense) is required.'}, status=status.HTTP_400_BAD_REQUEST)

    try:
        if entry_type == 'income':
            entry = Income.objects.get(id=entry_id, user_id=user_id)
        elif entry_type == 'expense':
            entry = Expense.objects.get(id=entry_id, user_id=user_id)
        else:
            return JsonResponse({'error': 'Invalid type. Must be "income" or "expense".'}, status=status.HTTP_400_BAD_REQUEST)

        entry.delete()
        return JsonResponse({'message': f'{entry_type.capitalize()} entry deleted successfully.'}, status=status.HTTP_204_NO_CONTENT)

    except (Income.DoesNotExist, Expense.DoesNotExist):
        return JsonResponse({'error': f'{entry_type.capitalize()} entry not found.'}, status=status.HTTP_404_NOT_FOUND)

def delete_budget_entry(request, user_id, entry_id):
    try:
        # Check if the entry exists for the user
        budget_entry = get_object_or_404(MonthlyBudget, id=entry_id, user_id=user_id)
        
        # Delete the entry
        budget_entry.delete()
        
        # Return a 204 No Content response
        return JsonResponse({}, status=204)  # Empty response body with status 204 (No Content)
    
    except MonthlyBudget.DoesNotExist:
        return JsonResponse({'error': 'Budget entry not found.'}, status=404)
    except Exception as e:
        # Log the error for debugging purposes
        print(f"Error deleting budget entry: {str(e)}")
        return JsonResponse({'error': 'An error occurred while deleting the entry.'}, status=500)

@api_view(['GET'])
def get_reports(request, user_id):
    try:
        # Get filters from query params
        start_date = request.GET.get('start_date')
        end_date = request.GET.get('end_date')
        category = request.GET.get('category')

        # Expense categories (filtered if needed)
        expense_qs = Expense.objects.filter(user_id=user_id)
        if start_date and end_date:
            expense_qs = expense_qs.filter(date__range=[start_date, end_date])
        if category and category != 'all':
            expense_qs = expense_qs.filter(category=category)
        expense_categories = expense_qs.values('category').annotate(
            total=Sum('expense')
        ).order_by('-total')

        # Monthly data (filtered if needed)
        monthly_expense_qs = Expense.objects.filter(user_id=user_id)
        if start_date and end_date:
            monthly_expense_qs = monthly_expense_qs.filter(date__range=[start_date, end_date])
        if category and category != 'all':
            monthly_expense_qs = monthly_expense_qs.filter(category=category)
        six_months_ago = datetime.now() - timedelta(days=180)
        monthly_expense_qs = monthly_expense_qs.filter(date__gte=six_months_ago)
        monthly_data = monthly_expense_qs.annotate(
            month=TruncMonth('date')
        ).values('month', 'category').annotate(
            total=Sum('expense')
        ).order_by('month')

        # Process monthly data into income vs expenses format (expenses only, as before)
        processed_monthly_data = []
        current_month = None
        month_data = {'income': 0, 'expenses': 0}
        for item in monthly_data:
            month_str = item['month'].strftime('%B %Y')
            if current_month != month_str:
                if current_month:
                    processed_monthly_data.append({
                        'month': current_month,
                        'income': month_data['income'],
                        'expenses': month_data['expenses']
                    })
                current_month = month_str
                month_data = {'income': 0, 'expenses': 0}
            if item['category'] == 'income':
                month_data['income'] = item['total']
            else:
                month_data['expenses'] = item['total']
        if current_month:
            processed_monthly_data.append({
                'month': current_month,
                'income': month_data['income'],
                'expenses': month_data['expenses']
            })

        # Calculate total income and expenses (filtered if needed)
        income_qs = Income.objects.filter(user_id=user_id)
        expense_qs = Expense.objects.filter(user_id=user_id)
        if start_date and end_date:
            income_qs = income_qs.filter(date__range=[start_date, end_date])
            expense_qs = expense_qs.filter(date__range=[start_date, end_date])
        if category and category != 'all':
            income_qs = income_qs.filter(category=category)
            expense_qs = expense_qs.filter(category=category)
        total_income = income_qs.aggregate(total=Sum('income'))['total'] or 0
        total_expenses = expense_qs.aggregate(total=Sum('expense'))['total'] or 0

        # Overall income vs expenses for bar chart
        overall_income_vs_expenses = {
            'income': float(total_income),
            'expenses': float(total_expenses)
        }

        # Overall expense categories for pie chart
        overall_expense_categories = list(expense_qs.values('category').annotate(total=Sum('expense')).order_by('-total'))

        return Response({
            'expense_categories': list(expense_categories),
            'monthly_data': processed_monthly_data,
            'total_income': float(total_income),
            'total_expenses': float(total_expenses),
            'overall_income_vs_expenses': overall_income_vs_expenses,
            'overall_expense_categories': overall_expense_categories
        })
    except Exception as e:
        return Response({'error': str(e)}, status=400)