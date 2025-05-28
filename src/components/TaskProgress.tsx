import React from 'react';
import { TaskStatus, projectStats } from '../data/taskProgress';

interface TaskProgressProps {
  tasks: TaskStatus[];
}

const getStatusColor = (status: TaskStatus['status']) => {
  switch (status) {
    case 'completed':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'in-progress':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'pending':
      return 'bg-gray-100 text-gray-600 border-gray-200';
    default:
      return 'bg-gray-100 text-gray-600 border-gray-200';
  }
};

const getStatusIcon = (status: TaskStatus['status']) => {
  switch (status) {
    case 'completed':
      return '✅';
    case 'in-progress':
      return '🔄';
    case 'pending':
      return '⏳';
    default:
      return '⏳';
  }
};

const ProgressBar: React.FC<{ progress: number; status: TaskStatus['status'] }> = ({ progress, status }) => {
  const getProgressColor = () => {
    switch (status) {
      case 'completed':
        return 'bg-green-500';
      case 'in-progress':
        return 'bg-blue-500';
      default:
        return 'bg-gray-300';
    }
  };

  return (
    <div className="w-full bg-gray-200 rounded-full h-2">
      <div 
        className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
        style={{ width: `${progress}%` }}
      />
    </div>
  );
};

export const TaskProgress: React.FC<TaskProgressProps> = ({ tasks }) => {
  const groupedTasks = tasks.reduce((acc, task) => {
    if (!acc[task.phase]) {
      acc[task.phase] = [];
    }
    acc[task.phase].push(task);
    return acc;
  }, {} as Record<string, TaskStatus[]>);

  return (
    <div className="max-w-4xl mx-auto p-6">
      {/* 프로젝트 통계 */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
        <h2 className="text-2xl font-bold text-gray-800 mb-4">ME.STORY 개발 진행 상황</h2>
        
        {/* 전체 진행률 */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-lg font-semibold text-gray-700">전체 진행률</span>
            <span className="text-2xl font-bold text-blue-600">{projectStats.overallProgress}%</span>
          </div>
          <ProgressBar progress={projectStats.overallProgress} status="in-progress" />
        </div>

        {/* 통계 카드들 */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <div className="bg-green-50 rounded-lg p-4 text-center border border-green-200">
            <div className="text-2xl font-bold text-green-600">{projectStats.completedTasks}</div>
            <div className="text-sm text-green-700">완료된 Task</div>
          </div>
          <div className="bg-blue-50 rounded-lg p-4 text-center border border-blue-200">
            <div className="text-2xl font-bold text-blue-600">{projectStats.inProgressTasks}</div>
            <div className="text-sm text-blue-700">진행 중인 Task</div>
          </div>
          <div className="bg-gray-50 rounded-lg p-4 text-center border border-gray-200">
            <div className="text-2xl font-bold text-gray-600">{projectStats.pendingTasks}</div>
            <div className="text-sm text-gray-700">대기 중인 Task</div>
          </div>
          <div className="bg-purple-50 rounded-lg p-4 text-center border border-purple-200">
            <div className="text-2xl font-bold text-purple-600">{projectStats.totalTasks}</div>
            <div className="text-sm text-purple-700">전체 Task</div>
          </div>
        </div>

        {/* Phase별 진행률 */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projectStats.phases.map((phase, index) => (
            <div key={index} className="bg-gray-50 rounded-lg p-4 border">
              <div className="flex justify-between items-center mb-2">
                <span className="font-medium text-gray-700">{phase.name}</span>
                <span className="text-sm text-gray-600">{phase.completed}/{phase.tasks}</span>
              </div>
              <ProgressBar progress={phase.progress} status={phase.progress === 100 ? 'completed' : phase.progress > 0 ? 'in-progress' : 'pending'} />
            </div>
          ))}
        </div>
      </div>

      {/* Phase별 Task 목록 */}
      {Object.entries(groupedTasks).map(([phase, phaseTasks]) => (
        <div key={phase} className="bg-white rounded-lg shadow-lg p-6 mb-6">
          <h3 className="text-xl font-bold text-gray-800 mb-4">{phase}</h3>
          
          <div className="space-y-4">
            {phaseTasks.map((task) => (
              <div key={task.id} className={`border rounded-lg p-4 ${getStatusColor(task.status)}`}>
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl">{getStatusIcon(task.status)}</span>
                    <div>
                      <h4 className="font-semibold">
                        #{task.id}. {task.title}
                      </h4>
                      <p className="text-sm opacity-80 mt-1">{task.description}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-lg">{task.progress}%</div>
                    {task.completedDate && (
                      <div className="text-xs opacity-70">완료: {task.completedDate}</div>
                    )}
                  </div>
                </div>
                
                <div className="mb-3">
                  <ProgressBar progress={task.progress} status={task.status} />
                </div>

                {/* Subtasks */}
                {task.subtasks && task.subtasks.length > 0 && (
                  <div className="mt-3 pl-6 border-l-2 border-gray-300">
                    <div className="text-sm font-medium text-gray-600 mb-2">서브태스크:</div>
                    {task.subtasks.map((subtask) => (
                      <div key={subtask.id} className="flex items-center space-x-2 mb-1">
                        <span className="text-sm">{getStatusIcon(subtask.status)}</span>
                        <span className="text-sm">{subtask.id}. {subtask.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};
