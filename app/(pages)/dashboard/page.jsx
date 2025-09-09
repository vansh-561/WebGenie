'use client'

import axios from 'axios';
import { useEffect, useState } from 'react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts'

function Dashboard() {
  const [metrics, setMetrics] = useState({});

  const getMetadata = async () => {
    const response = await axios.get('/api/metadata');
    setMetrics(response.data.user);
  }

  useEffect(() => {
    getMetadata();
  }, []);

  // dailyUsage: Array.from({ length: 30 }, (_, i) => ({
  //   date: new Date(Date.now() - (29 - i) * 24 * 60 * 60 * 1000).toLocaleDateString(),
  //   tokens: Math.floor(Math.random() * 2000)
  // })),




  // const metrics = {
  //   totalProjects: 12,
  //   tokensToday: 1543,
  //   tokensLeft: 98457,
  //   last30DaysUsage: 45678,
  //   recentProjects: [
  //     { id: 1, name: 'Project Alpha', lastUpdated: '2024-03-20' },
  //     { id: 2, name: 'Project Beta', lastUpdated: '2024-03-19' },
  //     { id: 3, name: 'Project Gamma', lastUpdated: '2024-03-18' },
  //   ]
  // }

  return (
    <div className="p-6">

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-white">Total Projects</h2>
            <p className="text-2xl font-bold">{metrics?.projects?.[0]?.total || 0}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-white">Tokens Used Today</h2>
          <p className="text-2xl font-bold">{metrics?.tokensToday || 0}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-white">Last 30 Days Usage</h2>
          <p className="text-2xl font-bold">{metrics?.last30DaysUsage?.[0]?.tokens || 0}</p>
        </div>
        <div className="bg-gray-700 p-4 rounded-lg shadow">
          <h2 className="text-white">Tokens Left</h2>
          <p className="text-2xl font-bold">{metrics?.totalTokens || 0}</p>
        </div>
      </div>

      {/* <div className="bg-gray-700 p-4 rounded-lg shadow mb-8">
        <h2 className="text-xl font-semibold mb-4">Last 30 Days Token Usage</h2>
        <div className="h-[300px]">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={metrics.dailyUsage}>
              <XAxis
                dataKey="date"
                tick={{ fill: '#9CA3AF' }}
                tickFormatter={(value) => new Date(value).getDate()}
              />
              <YAxis tick={{ fill: '#9CA3AF' }} />
              <Tooltip />
              <Bar dataKey="tokens" fill="#4F46E5" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div> */}

      {/* <div className="bg-gray-700 p-4 rounded-lg shadow">
        <h2 className="text-xl font-semibold mb-4">Recent Projects</h2>
        <div className="space-y-3">
          {metrics?.projects?.[0]?.projectList?.map(project => (
            <div key={project._id} className="flex justify-between items-center border-b pb-2">
              <span className="font-medium">{project.name}</span>
              <span className="text-gray-500 text-sm">
                {new Date(project.updatedAt).toLocaleDateString()}
              </span>
            </div>
          ))}
        </div>
      </div> */}
    </div>
  )
}

export default Dashboard