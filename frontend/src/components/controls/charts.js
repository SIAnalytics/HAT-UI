import React from "react";
import { 
  Bar, 
  Line,
  Pie 
} from "react-chartjs-2";

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

class PieChart extends React.Component {
  constructor(props) {
    super(props);
    this.data = {
      labels: ["Cat1", "Cat2", "Cat3", "Cat4", "Cat5"],
      datasets: [
        {
          data: [45, 30, 18, 15, 9],
          backgroundColor: [
            "#F7464A",
            "#46BFBD",
            "#FDB45C",
            "#949FB1",
            "#4D5360",
            "#AC64AD"
          ],
          hoverBackgroundColor: [
            "#FF5A5E",
            "#5AD3D1",
            "#FFC870",
            "#A8B3C5",
            "#616774",
            "#DA92DB"
          ],
          label: props["label"],
        }
      ]
    }

    this.className = props["className"];

    this.options = {
      maintainAspectRatio: false,
      plugins: {
        legend: {
            display: true,
            position: 'right',
        }
      }
    }
  }

  render() {
    return (
      <>
        <div className={this.className}>
          <div className="chart-style">
            <Pie data={this.data} options={this.options} />
          </div>
        </div>
      </>
    );
  }
}

export {
  LineChart,
  BarChart,
  PieChart,
};