from rest_framework import views
from rest_framework import status
from rest_framework.response import Response
from .utils import CommonUtils as utils
import json

class Common(views.APIView):
    #GET hadler
    def get(self, request):
        # Analyze request type and call corresponding interface function
        req = request.GET.get("req")

        if req == "GET_ROOT_CONTENT":
            return Response(utils.GetRootContent())
        elif req == "GET_DIRECTORY_CONTENT":
            return Response(utils.GetDirectoryContent(request.GET.get("path"), int(request.GET.get("parent")), int(request.GET.get("next_id"))))
        elif req == "GET_IMAGE_URL":
            return Response(utils.GetImageURL(request.GET.get("path")))
        else:
            print("[ERROR] Unsupported request content {}".format(req))

        return Response("Unsupported request content")

    #POST
    def post(self, request):
        req = request.POST.get("req")

        if req == "CREATE_NEW_DIRECTORY":
            return Response(utils.CreateNewDirectory(request.POST.get("path"), request.POST.get("new_folder")))

        res = {"code:": 400, "message": "Unsupported POST request content"}
        return Response(data=json.dumps(res), status=status.HTTP_400_BAD_REQUEST)

