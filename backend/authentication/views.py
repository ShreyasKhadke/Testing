from django.shortcuts import render


def index_view(request):
    context = {}
    if request.user.is_authenticated:
        # Get the user's name from their profile
        user_name = request.user.get_full_name() or request.user.first_name or request.user.username
        context['user_name'] = user_name
        context['user_email'] = request.user.email
    return render(request, 'authentication/index.html', context)