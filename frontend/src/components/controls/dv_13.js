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

class DV_13 extends React.Component {
    constructor(props) {
        super(props);

        var class_ratio_settings = [];
        var avg_bbox = [];
        var bar_class_ratio = [];

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

            var bar_class_data = {
                labels: [],
                datasets: [
                    {
                        label: "Class ratio",
                        data: [],
                        fill: true,
                        backgroundColor: "",
                        borderColor: "",
                    }
                ]
            }

            var bbox = {
                labels: [],
                datasets: [
                    {
                        label: "Average bbox",
                        data: [],
                        fill: true,
                        backgroundColor: "",
                        borderColor: "",
                    }
                ]
            }

            class_ratio_settings.push(setting);
            avg_bbox.push(bbox);
            bar_class_ratio.push(bar_class_data);

        }

        this.state = {
            class_ratio_settings: class_ratio_settings,
            avg_bbox: avg_bbox,
            bar_class_ratio: bar_class_ratio,
            mot_flag: true,
            show_mask: [true, false, false],
            style_mask: ["outline-secondary", "outline-secondary", "outline-secondary"]
        }

        SetGraphData = SetGraphData.bind(this);
    }

    ToggleVisibleCharts = (part) => {
        var show_mask = [false, false, false];
        var style_mask = ["outline-secondary", "outline-secondary", "outline-secondary"];
        show_mask[part - 1] = true;
        style_mask[part - 1] = "secondary"
        var state = {
            show_mask: show_mask,
            style_mask: style_mask
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
                        <Button disabled={!this.state.mot_flag} onClick={() => { this.ToggleVisibleCharts(1) }} variant={this.state.style_mask[0]}>TRN</Button>
                        <Button disabled={!this.state.mot_flag} onClick={() => { this.ToggleVisibleCharts(2) }} variant={this.state.style_mask[1]}>VAL</Button>
                        <Button disabled={!this.state.mot_flag} onClick={() => { this.ToggleVisibleCharts(3) }} variant={this.state.style_mask[2]}>TST</Button>
                    </ButtonGroup>
                </InputGroup>

                <Form className='d-flex'>
                    {this.state.show_mask[0] ? <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings[0]} chart_type="chart-style-large" className="col-md-4" /> : null}
                    {this.state.show_mask[0] ? <BarChart label="클래스 분포" graph_data={this.state.bar_class_ratio[0]} className="col-md-4" chart_type="chart-style-large" /> : null}
                    {this.state.show_mask[0] ? <BarChart label="영상 별 객체수" graph_data={this.state.avg_bbox[0]} className="col-md-4" chart_type="chart-style-large" /> : null}

                    {this.state.show_mask[1] ? <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings[1]} chart_type="chart-style-large" className="col-md-4" /> : null}
                    {this.state.show_mask[1] ? <BarChart label="클래스 분포" graph_data={this.state.bar_class_ratio[1]} className="col-md-4" chart_type="chart-style-large" /> : null}
                    {this.state.show_mask[1] ? <BarChart label="영상 별 객체수" graph_data={this.state.avg_bbox[1]} className="col-md-4" chart_type="chart-style-large" /> : null}

                    {this.state.show_mask[2] ? <PieChart label="클래스 분포" graph_data={this.state.class_ratio_settings[2]} className="col-md-4" chart_type="chart-style-large" /> : null}
                    {this.state.show_mask[2] ? <BarChart label="클래스 분포" graph_data={this.state.bar_class_ratio[2]} className="col-md-4" chart_type="chart-style-large" /> : null}
                    {this.state.show_mask[2] ? <BarChart label="영상 별 객체수" graph_data={this.state.avg_bbox[2]} className="col-md-4" chart_type="chart-style-large" /> : null}
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
        case "1":
            return "Vehicle";
        case "20":
        case "2":
            return "Military vehicle";
        case "30":
        case "3":
            return "Military equipment";
        case "40":
        case "4":
            return "Person";
        case "50":
        case "5":
            return "Bicycle";
        case "70":
        case "0":
            return "Undefined";
        default:
            return "Unknown";
    }
}

function SetGraphData(data) {
    var state = {};

    console.log(data);

    var dataset_data = data.class_info;
    var stat_info = data.stat_info;

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

        var bbox = {
            labels: [],
            datasets: [
                {
                    label: "Average bbox",
                    data: [],
                    fill: true,
                    backgroundColor: GraphStyles[3].backgroundColor,
                    borderColor: GraphStyles[3].hoverBackgroundColor
                }
            ]
        };

        var bar_class_data = {
            labels: [],
            datasets: [
                {
                    label: "Class ratio",
                    data: [],
                    fill: true,
                    backgroundColor: [],
                    borderColor: []
                }
            ]
        };

        var entry_count = 0;
        Object.entries(dataset_data).forEach(([key, value]) => {
            class_ratio_settings.labels.push(KeyToClassName(key));
            class_ratio_settings.datasets[0].data.push(value);
            class_ratio_settings.datasets[0].backgroundColor.push(GraphStyles[entry_count % GraphStyles.length].backgroundColor);
            class_ratio_settings.datasets[0].hoverBackgroundColor.push(GraphStyles[entry_count % GraphStyles.length].hoverBackgroundColor);


            bar_class_data.labels.push(KeyToClassName(key));
            bar_class_data.datasets[0].data.push(value);
            bar_class_data.datasets[0].backgroundColor.push(GraphStyles[4].backgroundColor);
            entry_count += 1;
        });

        Object.entries(stat_info).forEach(([key, value]) => {
            bbox.labels.push(KeyToClassName(key));
            bbox.datasets[0].data.push((value.width / value.count) * (value.height / value.count))
        });

        var state = {
            class_ratio_settings: [

            ],
            bar_class_ratio: [

            ],
            avg_bbox: [

            ],
        };
        state.class_ratio_settings.push(class_ratio_settings);
        state.avg_bbox.push(bbox);
        state.bar_class_ratio.push(bar_class_data);
        state.show_mask = [true, false, false];
        state.style_mask = ["outline-secondary", "outline-secondary", "outline-secondary"];
        state.mot_flag = false;

        this.setState(state);
    } else {
        var state = {};
        state.class_ratio_settings = [];
        state.avg_bbox = [];

        Object.entries(dataset_data).forEach(([subset, subset_data]) => {
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

            var bar_class_data = {
                labels: [],
                datasets: [
                    {
                        label: "Class ratio",
                        data: [],
                        fill: true,
                        backgroundColor: [],
                        borderColor: []
                    }
                ]
            };

            var setting_no = 0;
            switch (subset) {
                case "val": {
                    setting_no = 1;
                    break;
                }
                case "test": {
                    setting_no = 2;
                    break;
                }
                default: {
                    break;
                }
            }

            var entry_count = 0;

            Object.entries(subset_data).forEach(([key, value]) => {
                class_ratio_settings.labels.push(KeyToClassName(key));
                class_ratio_settings.datasets[0].data.push(value);
                class_ratio_settings.datasets[0].backgroundColor.push(GraphStyles[entry_count % GraphStyles.length].backgroundColor);
                class_ratio_settings.datasets[0].hoverBackgroundColor.push(GraphStyles[entry_count % GraphStyles.length].hoverBackgroundColor);

                bar_class_data.labels.push(KeyToClassName(key));
                bar_class_data.datasets[0].data.push(value);
                bar_class_data.datasets[0].backgroundColor.push(GraphStyles[3].backgroundColor);
                entry_count += 1;
            });

            state.class_ratio_settings[setting_no] = class_ratio_settings;
            state.bar_class_ratio[setting_no] = bar_class_data;
        });

        Object.entries(stat_info).forEach(([subset, subset_data]) => {
            var bbox = {
                labels: [],
                datasets: [
                    {
                        label: "Average bbox",
                        data: [],
                        fill: true,
                        backgroundColor: GraphStyles[3].backgroundColor,
                        borderColor: GraphStyles[3].hoverBackgroundColor
                    }
                ]
            };

            var setting_no = 0;
            switch (subset) {
                case "val": {
                    setting_no = 1;
                    break;
                }
                case "test": {
                    setting_no = 2;
                    break;
                }
                default: {
                    break;
                }
            }

            Object.entries(subset_data).forEach(([key, value]) => {
                bbox.labels.push(KeyToClassName(key));
                bbox.datasets[0].data.push((value.width / value.count) * (value.height / value.count));
            });

            state.avg_bbox[settings_no] = bbox;
        });

        state.mot_flag = true;
        state.style_mask = ["secondary", "outline-secondary", "outline-secondary"];
        this.setState(state);
    }
}

export default DV_13;
export {
    SetGraphData
};