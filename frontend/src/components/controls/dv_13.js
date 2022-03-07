import { DatasetController } from "chart.js";
import React from "react";
import {
    Form,
    ButtonGroup,
    Button,
    InputGroup
} from "react-bootstrap";
import {
    LineChart,
    BarChart,
    PieChart
} from "./charts"

class DV_13 extends React.Component{
    constructor(props) {
        super(props);

        var class_ratio_settings = [];
        for (var i = 0; i < 3; i++) {
            var setting = {
                labels: [],
                datasets: [
                    {
                        data: [],
                        backgroundColor: [],
                        hoverBackgroundColor: [],
                        label: ""
                    }
                ]
            }

            class_ratio_settings.push(setting);
        }

        this.state = {
            class_ratio_settings: class_ratio_settings,
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
            },
            mot_flag: false,
            show_mask: [true, false, false],
        }

        SetGraphData = SetGraphData.bind(this);
    }

    ToggleVisibleCharts = (part) => {
        var show_mask = [false, false, false];
        show_mask[part - 1] = true;
        var state = {
            show_mask: show_mask
        };

        this.setState(state);
    }

    render() {
        return (
            <>
                <InputGroup>
                    <h5 className="col-md-6"><b>데이터셋 통계</b></h5>
                    <div className="col-md-3"></div>
                    <ButtonGroup className="col-md-3">
                        <Button disabled={!this.state.mot_flag} onClick={() => { this.ToggleVisibleCharts(1) }} variant="outline-secondary">TRN</Button>
                        <Button disabled={!this.state.mot_flag} onClick={() => { this.ToggleVisibleCharts(2) }} variant="outline-secondary">VAL</Button>
                        <Button disabled={!this.state.mot_flag} onClick={() => { this.ToggleVisibleCharts(3) }} variant="outline-secondary">TST</Button>
                    </ButtonGroup>
                </InputGroup>
                
                <Form className='d-flex'>
                    {this.state.show_mask[0] ? <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings[0]} className="col-md-3"/> : null}
                    {this.state.show_mask[0] ? <LineChart  label="프레임별 클래스" graph_data={this.state.frame_class_settings} className="col-md-3"/> : null}
                    {this.state.show_mask[0] ? <BarChart label="영상 별 객체수" className="col-md-3"/> : null}
                    {this.state.show_mask[0] ? <BarChart label="클래스 분포" className="col-md-3"/> : null}

                    {this.state.show_mask[1] ? <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings[1]} className="col-md-3"/> : null}
                    {this.state.show_mask[1] ? <BarChart label="영상 별 객체수" className="col-md-3"/> : null}
                    {this.state.show_mask[1] ? <BarChart label="영상 별 객체수" className="col-md-3"/> : null}
                    {this.state.show_mask[1] ? <LineChart  label="프레임별 클래스" graph_data={this.state.frame_class_settings} className="col-md-3"/> : null}

                    {this.state.show_mask[2] ? <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings[2]} className="col-md-3"/> : null}
                    {this.state.show_mask[2] ? <BarChart label="영상 별 객체수" className="col-md-3"/> : null}
                    {this.state.show_mask[2] ? <BarChart label="영상 별 객체수" className="col-md-3"/> : null}
                    {this.state.show_mask[2] ? <BarChart label="영상 별 객체수" className="col-md-3"/> : null}
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

function SetGraphData(data) {
    var state = {};

    var dataset_data = data.class_info;

    if (data.dataset_type == "TOI") {
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

        var state = {
            class_ratio_settings: [

            ]
        };
        state.class_ratio_settings.push(class_ratio_settings);
        state.show_mask = [true, false, false];
        state.mot_flag = false;

        this.setState(state);
    } else {
        var state = {};
        state.class_ratio_settings = [];
        Object.entries(dataset_data).forEach(([subset, subset_data]) => {
            var setting_no = 0;
            switch(subset) {
                case "val": {
                    setting_no = 1;
                    break;
                }
                case "test": {
                    setting_no = 2;
                    break;
                }
                default:
                    {
                        break;
                    }
            }

            var entry_count = 0;
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
            Object.entries(subset_data).forEach(([key, value]) => {
                class_ratio_settings.labels.push(KeyToClassName(key));
                class_ratio_settings.datasets[0].data.push(value);
                class_ratio_settings.datasets[0].backgroundColor.push(GraphStyles[entry_count % GraphStyles.length].backgroundColor);
                class_ratio_settings.datasets[0].hoverBackgroundColor.push(GraphStyles[entry_count % GraphStyles.length].hoverBackgroundColor);
                entry_count += 1;
            });

            state.class_ratio_settings[setting_no] = class_ratio_settings;
        });
        
        state.mot_flag = true;
        this.setState(state);
    }
}

export default DV_13;
export {
    SetGraphData
};