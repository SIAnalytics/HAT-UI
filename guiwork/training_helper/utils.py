import os
import json

from django.conf import settings

class TrainingHelperUtils:
    @staticmethod
    def GetModelsList():
        model_list = [
            { 
                "id": "Model name 1",
                "name": "Model name 1"
            },
            { 
                "id": "Model name 2",
                "name": "Model name 2"
            },
            { 
                "id": "Model name 3",
                "name": "Model name 3"
            },
            { 
                "id": "Model name 4",
                "name": "Model name 4"
            },
            { 
                "id": "Model name 5",
                "name": "Model name 5"
            },
        ]

        return model_list
    
    @staticmethod
    def GetModelHyperparams(model_name):
        ret_list = []

        if model_name == "Model name 5":
            ret_list = [
                {
                    "name": "Minibatch",
                    "value": 10
                },
                {
                    "name": "Epochs",
                    "value": 100000
                },
                {
                    "name": "Learning rates",
                    "value": 0.1234
                },
                {
                    "name": "검증 주기",
                    "value": 5
                }
            ]
        else:
            ret_list = [
                {
                    "name": "Param 1",
                    "value": 10
                },
                {
                    "name": "Param 2",
                    "value": 0.1
                },
                {
                    "name": "Param 3",
                    "value": 0.2
                },
                {
                    "name": "Param 4",
                    "value": 13
                },
                {
                    "name": "Param 5",
                    "value": 10000
                },
                {
                    "name": "Param 6",
                    "value": 0.123
                },
            ]

        return ret_list
        