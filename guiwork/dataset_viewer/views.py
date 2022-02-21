from rest_framework import views
from rest_framework.response import Response
import json
from .utils import DatasetViewerUtils as utils

class DatasetViewer(views.APIView):
    
    #GET hadler
    def get(self, request):
        req = request.GET.get("req")

        if req == "GET_VIDEOS_FROM_PATH":
            return Response(utils.GetVideosFromPath(request.GET.get("path")))        

        res = {"code": 400, "message": "Unsupported request content"}
        return Response(data=json.dumps(res), status=status.HTTP_400_BAD_REQUEST)

    #POST handler
    def post(self, request):
        content = {
            "type": "POST",
            "purpose": "REST API POST"
        }

        return Response(content)
