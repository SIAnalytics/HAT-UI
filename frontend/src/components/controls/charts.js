import React from "react";
import { Bar, Line } from "react-chartjs-2";
import Chart from 'chart.js/auto'

class LineChart extends React.Component {
  constructor(props) {
    super(props);

    this.data = {
        labels: ["1", "2", "3",
          "4", "5", "6"],
        datasets: [
          {
            label: props["label"],
            data: [0.9, 0.7, 0.6, 0.6, 0.5, 0.3, 0.1],
            fill: true,
            backgroundColor: "rgba(6, 156, 51, 0.3)",
            borderColor: "#02b844",
          }
        ]
    };

    this.className = props["className"]
  }

  render() {
    return (
        <>
          <div className={this.className}>
            <div className="chart-style">
              <Line data={this.data} options={{ maintainAspectRatio: true }}/>
            </div>
          </div>
        </>
    );
  }
}

class BarChart extends React.Component {
  constructor(props) {
    super(props);

    this.data = {
      labels: ["1", "2", "3",
        "4", "5", "6"],
      datasets: [
        {
          label: props["label"],
          data: [0.2, 0.3, 0.4, 0.8, 0.6, 0.2, 0.3],
          fill: true,
          backgroundColor: "rgba(62, 139, 240, 0.8)",
          borderColor: "#096beb",
        }
      ]
    };

    this.className = props["className"]
  }

  render() {
    return (
      <>
        <div className={this.className}>
          <div className="chart-style">
            <Bar data={this.data} options={{ maintainAspectRatio: true }}/>
          </div>
        </div>
      </>
    );
  }
}

export {
  LineChart,
  BarChart,
};