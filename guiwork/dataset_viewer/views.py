from rest_framework import views
from rest_framework.response import Response
from rest_framework import status
import json
from .utils import DatasetViewerUtils as utils

class DatasetViewer(views.APIView):
    
    #GET hadler
    def get(self, request):
        req = request.GET.get("req")

        if req == "GET_VIDEOS_FROM_PATH":
            return Response(utils.GetVideosFromPath(request.GET.get("path")))        
        elif req == "CONVERT_DATASET":
            return Response(utils.ProcessConvertDataset(request.GET.get("path"), request.GET.get("convert_from"), request.GET.get("convert_to")))
        elif req == "GET_DATASET_SEPARATION_STATUS":
            return Response(utils.GetDatasetSeparationStatus(request.GET.get("pid")))
        elif req == "GET_DATASET_CONVERSION_STATUS":
            return Response(utils.GetDatasetConversionStatus(request.GET.get("pid")))

        res = {"code": 400, "message": "Unsupported GET request content"}
        return Response(data=json.dumps(res), status=status.HTTP_400_BAD_REQUEST)

    #POST handler
    def post(self, request):
        req = request.POST.get("req")

        print(req)

        if req == "RUN_DATASET_SEPARATION":
            for key in request.POST.keys():
                print("{} {}".format(key, request.POST.get(key)))
            return Response(utils.RunDatasetSeparation(request.POST))
        
        res = {"code": 400, "message": "Unsupported POST request content"}
        return Response(data=json.dumps(res), status=status.HTTP_400_BAD_REQUEST)
