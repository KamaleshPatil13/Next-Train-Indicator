import { useState, useEffect } from "react";
import moment from "moment";
import './App.css';

export const trainSchedules = [
  { destination: "Central Station", frequency: 20 },
  { destination: "Circular", frequency: 60 },
  { destination: "North Square", frequency: 12, start: 7, end: 22 },
  { destination: "West Market", frequency: 6, start: 5.5, end: 1.5 },
];

interface TrainSchedule {
  destination: string;
  frequency: number;
  start?: number;
  end?: number;  
}

interface TrainArrival {
  destination: string;
  arrivalTime: moment.Moment;
  minutesAway: number;
}

const VirtualTimeSpeed = 10; 
const StartTime = moment().set({ hour: 5, minute: 0, second: 0 });

const getTrainArrivals = (currentTime: moment.Moment): TrainArrival[] => {
  return trainSchedules
    .flatMap(({ destination, frequency, start = 0, end = 24 }: TrainSchedule) => {
      let arrivals: TrainArrival[] = [];
      for (let hour = 5; hour < 24; hour++) {
        for (let min = 0; min < 60; min += frequency) {
          let trainTime = moment(currentTime).clone().set({ hour, minute: min, second: 0 });
          if (trainTime.isAfter(currentTime) && hour >= start && hour < end) {
            arrivals.push({
              destination,
              arrivalTime: trainTime,
              minutesAway: trainTime.diff(currentTime, "minutes"),
            });
          }
        }
      }
      return arrivals;
    })
    .sort((a, b) => a.arrivalTime.valueOf() - b.arrivalTime.valueOf())
    .slice(0, 2);
};

const App = () => {
  const [virtualTime, setVirtualTime] = useState<moment.Moment>(StartTime);
  const [trainArrivals, setTrainArrivals] = useState<TrainArrival[]>(getTrainArrivals(StartTime));

  useEffect(() => {
    const interval = setInterval(() => {
      setVirtualTime((prevTime) => {
        const newTime = moment(prevTime).add(1, "minute");
        setTrainArrivals(getTrainArrivals(newTime));
        return newTime;
      });
    }, 1000 / VirtualTimeSpeed);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="container">
      <div style={{alignItems:'end'}}>
      <h2 className="header">🚆 Next Train Indicator</h2>
      <ul className="train-list">
        {trainArrivals.length > 0 ? (
          trainArrivals.map((train, index) => (
            <li key={index} className="train-item">
              <span>{train.destination}</span>
              <span className="train-time">{train.minutesAway} min</span>
            </li>
          ))
        ) : (
          <li className="train-item">No upcoming trains</li>
        )}
      </ul>
      <div className="virtual-time">
        🕒 Virtual Time: {virtualTime.format("HH:mm")}
      </div>
      </div>
    </div>
  );
  
};

export default App;
