import React from 'react';
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer
} from 'recharts';

const ResumeScoreChart = ({ scores }) => {
  return (
    <div className="resume-score-chart-container">
      <ResponsiveContainer width="100%" height={250}>
        <BarChart data={scores}>
          <XAxis dataKey="name" stroke="#a0aec0" />
          <YAxis stroke="#a0aec0" />
          <Tooltip />
          <Bar dataKey="score" fill="#68d391" barSize={35} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ResumeScoreChart;
