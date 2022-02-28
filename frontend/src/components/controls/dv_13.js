import { DatasetController } from "chart.js";
import React from "react";
import {
    Form
} from "react-bootstrap";
import {
    LineChart,
    BarChart,
    PieChart
} from "./charts"

class DV_13 extends React.Component{
    constructor(props) {
        super(props);

        this.state = {
            class_ratio_settings: {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: [],
                        hoverBackgroundColor: [],
                        label: ""
                    }
                ]
            },
            frame_class_settings: {
                labels: [],
                datasets: [
                    {
                        label: "",
                        data: [],
                        fill: true,
                        backgroundColor: "",
                        borderColor: "",
                    }
                ]
            }
        }

        SetGraphData = SetGraphData.bind(this);
    }

    render() {
        return (
            <>
                <h5><b>데이터셋 통계</b></h5>
                <Form className='d-flex'>
                    <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings} className="col-md-3"/>
                    <LineChart  label="프레임별 클래스" graph_data={this.state.frame_class_settings} className="col-md-3"/> 
                    <BarChart label="영상 별 객체수" className="col-md-3"/>
                    <BarChart label="클래스 분포" className="col-md-3"/>
                </Form>
            </>
        );
    }
}

var GraphStyles = [
    {
        backgroundColor: "#ff1100",
        hoverBackgroundColor: "rgba(255, 17, 0, 0.5)",
    },
    {
        backgroundColor: "#ffd900",
        hoverBackgroundColor: "rgba(255, 217, 0, 0.5)"
    },
    {
        backgroundColor: "#238c00",
        hoverBackgroundColor: "rgba(35, 140, 0, 0.5)"
    },
    {
        backgroundColor: "#008c80",
        hoverBackgroundColor: "rgba(0, 140, 128, 0.5)"
    },
    {
        backgroundColor: "#0013c2",
        hoverBackgroundColor: "rgba(0, 19, 194, 0.5)"
    },
    {
        backgroundColor: "#9800c2",
        hoverBackgroundColor: "rgba(152, 0, 194, 0.5)"
    },
    {
        backgroundColor: "#827e7f",
        hoverBackgroundColor: "rgba(130, 126, 127, 0.5)"
    },
    {
        backgroundColor: "#000000",
        hoverBackgroundColor: "rgba(0, 0, 0, 0.5)"
    },
    {
        backgroundColor: "#7d9e81",
        hoverBackgroundColor: "rgba(125, 158, 129, 0.5)"
    },
    {
        backgroundColor: "#7777ba",
        hoverBackgroundColor: "rgba(119, 119, 186, 0.5"
    },
]

function KeyToClassName(key) {
    switch (key.toString()) {
        case "10":
            return "Car";
        case "20":
            return "Military car";
        case "30":
            return "Military object";
        case "40":
            return "Person";
        case "50":
            return "Bike";
        case "70":
            return "Undefined";
        default:
            return "Unknown";
    }
}

function SetGraphData(dataset_data, frame_data) {
    var state = {};

    // Set up class ration diargam
    var class_ratio_settings = {
        labels: [],
        datasets: [
            {
                data: [],
                backgroundColor: [],
                hoverBackgroundColor: [],
                label: ""
            }
        ]
    };

    var entry_count = 0;
    Object.entries(dataset_data).forEach(([key, value]) => {
        class_ratio_settings.labels.push(KeyToClassName(key));
        class_ratio_settings.datasets[0].data.push(value);
        class_ratio_settings.datasets[0].backgroundColor.push(GraphStyles[entry_count % GraphStyles.length].backgroundColor);
        class_ratio_settings.datasets[0].hoverBackgroundColor.push(GraphStyles[entry_count % GraphStyles.length].hoverBackgroundColor);
        entry_count += 1;
    });

    // Setup classes by frame 
    var frame_class_settings = {
        labels: [],
        datasets: [
/*            {
                label: "",
                data: [],
                fill: true,
                backgroundColor: "",
                borderColor: "",
            }*/
        ]
    };

    /*
    var file_names = Object.keys(frame_data);
    for (var i = 0; i < file_names.length; i++) {
        if (i == 0) {
            // Set labels data only 1 time
            frame_class_settings.labels = Object.keys(frame_data[file_names[i]]);
        }

        var dataset = {};
        dataset.label = file_names[i];
        dataset.data = Object.values(frame_data[file_names[i]]);
        dataset.fill = true;
        dataset.backgroundColor = GraphStyles[i % GraphStyles.length].hoverBackgroundColor
        dataset.borderColor = GraphStyles[i % GraphStyles.length].backgroundColor

        frame_class_settings.datasets.push(dataset);
    }*/

    var state = {};
    state.class_ratio_settings = class_ratio_settings;
    //state.frame_class_settings = frame_class_settings;

    this.setState(state);
}

export default DV_13;
export {
    SetGraphData
};