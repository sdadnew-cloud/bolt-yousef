import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useStore } from '@nanostores/react';
import { themeStore } from '~/lib/stores/theme';
import { dependencyAwarenessService } from '~/lib/services/dependencyAwarenessService';
import { staticAnalysisService } from '~/lib/services/staticAnalysisService';
import { securityScannerService } from '~/lib/services/securityScannerService';
import { nicheAgentsService } from '~/lib/services/nicheAgentsService';
import { scheduledTasksService } from '~/lib/services/scheduledTasksService';

const DashboardTab = () => {
  const theme = useStore(themeStore);
  const [stats, setStats] = useState({
    totalDependencies: 0,
    outdatedDependencies: 0,
    securityIssues: 0,
    totalTasks: 0,
    activeTasks: 0,
    availableAgents: 0
  });

  useEffect(() => {
    // Simulate loading stats on component mount
    const loadStats = async () => {
      // Mock stats since we don't have an actual data source connected
      setStats({
        totalDependencies: 42,
        outdatedDependencies: 5,
        securityIssues: 2,
        totalTasks: 12,
        activeTasks: 3,
        availableAgents: nicheAgentsService.getAgents().length
      });
    };

    loadStats();
  }, []);

  const StatCard = ({ title, value, subtitle, color = 'purple', icon }) => (
    <motion.div
      className={`p-4 rounded-xl border ${
        theme === 'dark' 
          ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
          : 'bg-white border-[#E5E5E5]'
      }`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <div className="flex items-center gap-3 mb-2">
        <div className={`p-2 rounded-lg bg-${color}-500/10`}>
          <div className={`${icon} text-${color}-500`} />
        </div>
        <h3 className="font-medium text-bolt-elements-textSecondary">{title}</h3>
      </div>
      <div className="text-2xl font-bold text-bolt-elements-textPrimary">{value}</div>
      <div className="text-xs text-bolt-elements-textTertiary mt-1">{subtitle}</div>
    </motion.div>
  );

  const FeatureCard = ({ title, description, status, onClick }) => (
    <motion.div
      className={`p-4 rounded-xl border ${
        theme === 'dark' 
          ? 'bg-[#0A0A0A] border-[#1A1A1A] hover:bg-[#1A1A1A] cursor-pointer' 
          : 'bg-white border-[#E5E5E5] hover:bg-[#FAFAFA] cursor-pointer'
      }`}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClick}
    >
      <div className="flex items-start justify-between">
        <div>
          <h3 className="font-medium text-bolt-elements-textPrimary">{title}</h3>
          <p className="text-sm text-bolt-elements-textSecondary mt-1">{description}</p>
        </div>
        <div className={`px-2 py-1 rounded-full text-xs ${
          status === 'active' ? 'bg-green-500/10 text-green-500' : 'bg-gray-500/10 text-gray-500'
        }`}>
          {status}
        </div>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-bolt-elements-textPrimary">Platform Dashboard</h2>
        <p className="text-bolt-elements-textSecondary">
          Overview of your development environment and active features
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <StatCard
          title="Dependencies"
          value={stats.totalDependencies}
          subtitle={`${stats.outdatedDependencies} outdated`}
          color="blue"
          icon="i-ph:package"
        />
        <StatCard
          title="Security Issues"
          value={stats.securityIssues}
          subtitle="Critical vulnerabilities"
          color="red"
          icon="i-ph:shield-check"
        />
        <StatCard
          title="Active Tasks"
          value={stats.activeTasks}
          subtitle={`of ${stats.totalTasks} total`}
          color="green"
          icon="i-ph:calendar-check"
        />
        <StatCard
          title="Available Agents"
          value={stats.availableAgents}
          subtitle="Niche AI experts"
          color="purple"
          icon="i-ph:users"
        />
        <StatCard
          title="Code Quality"
          value="92%"
          subtitle="Based on static analysis"
          color="indigo"
          icon="i-ph:code"
        />
        <StatCard
          title="Performance"
          value="A+"
          subtitle="Load time optimized"
          color="yellow"
          icon="i-ph:speedometer"
        />
      </div>

      {/* Feature Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FeatureCard
          title="AI Pair Programmer"
          description="Real-time reasoning visualization with interrupt capabilities"
          status="active"
          onClick={() => console.log('AI Pair Programmer clicked')}
        />
        <FeatureCard
          title="Security Scanner"
          description="Continuous vulnerability detection and reporting"
          status="active"
          onClick={() => console.log('Security Scanner clicked')}
        />
        <FeatureCard
          title="Device Emulator"
          description="Test UI on iPhone, iPad, and Android devices"
          status="active"
          onClick={() => console.log('Device Emulator clicked')}
        />
        <FeatureCard
          title="Niche Agents"
          description="Access to 8 specialized AI experts for different domains"
          status="active"
          onClick={() => console.log('Niche Agents clicked')}
        />
      </div>

      {/* Recent Activity */}
      <div className={`rounded-xl border p-4 ${
        theme === 'dark' 
          ? 'bg-[#0A0A0A] border-[#1A1A1A]' 
          : 'bg-white border-[#E5E5E5]'
      }`}>
        <h3 className="font-medium text-bolt-elements-textPrimary mb-3">Recent Activity</h3>
        <div className="space-y-3">
          {[
            { action: 'Security scan completed', time: '2 min ago', type: 'security' },
            { action: 'Dependency analysis updated', time: '15 min ago', type: 'analysis' },
            { action: 'Task scheduled: nightly build', time: '1 hour ago', type: 'task' },
            { action: 'New agent selected: Cybersecurity Expert', time: '2 hours ago', type: 'agent' }
          ].map((activity, index) => (
            <div key={index} className="flex items-center gap-3 text-sm">
              <div className={`w-2 h-2 rounded-full ${
                activity.type === 'security' ? 'bg-red-500' :
                activity.type === 'analysis' ? 'bg-blue-500' :
                activity.type === 'task' ? 'bg-green-500' : 'bg-purple-500'
              }`} />
              <div className="flex-1 text-bolt-elements-textSecondary">{activity.action}</div>
              <div className="text-bolt-elements-textTertiary">{activity.time}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Call to Action Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <motion.div
          className={`p-4 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-purple-900/30 to-blue-900/30 border-purple-500/30' 
              : 'bg-gradient-to-br from-purple-50 to-blue-50 border-purple-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <h3 className="font-medium text-bolt-elements-textPrimary mb-2">Run Full Analysis</h3>
          <p className="text-sm text-bolt-elements-textSecondary mb-3">
            Comprehensive check of dependencies, security, and code quality
          </p>
          <button className="px-3 py-1.5 text-sm bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors">
            Start Scan
          </button>
        </motion.div>

        <motion.div
          className={`p-4 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-green-900/30 to-teal-900/30 border-green-500/30' 
              : 'bg-gradient-to-br from-green-50 to-teal-50 border-green-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <h3 className="font-medium text-bolt-elements-textPrimary mb-2">Schedule Task</h3>
          <p className="text-sm text-bolt-elements-textSecondary mb-3">
            Automate builds, tests, and deployments
          </p>
          <button className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
            Configure
          </button>
        </motion.div>

        <motion.div
          className={`p-4 rounded-xl border ${
            theme === 'dark' 
              ? 'bg-gradient-to-br from-indigo-900/30 to-pink-900/30 border-indigo-500/30' 
              : 'bg-gradient-to-br from-indigo-50 to-pink-50 border-indigo-200'
          }`}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <h3 className="font-medium text-bolt-elements-textPrimary mb-2">Try Niche Agent</h3>
          <p className="text-sm text-bolt-elements-textSecondary mb-3">
            Access specialized AI expertise for your project
          </p>
          <button className="px-3 py-1.5 text-sm bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
            Browse Experts
          </button>
        </motion.div>
      </div>
    </div>
  );
};

export default DashboardTab;