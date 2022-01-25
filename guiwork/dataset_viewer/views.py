from rest_framework import views
from rest_framework.response import Response
import json

class DatasetViewer(views.APIView):
    
    #GET hadler
    def get(self, request):
        content = {
            "type": "GET",
            "purpose": "REST API GET"
        }

        return Response(content)

    #POST handler
    def post(self, request):
        content = {
            "type": "POST",
            "purpose": "REST API POST"
        }

        return Response(content)
