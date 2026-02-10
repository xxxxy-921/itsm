"use client"

import React, { useCallback } from 'react';
import ReactFlow, {
  MiniMap,
  Controls,
  Background,
  useNodesState,
  useEdgesState,
  Handle,
  Position,
  MarkerType,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { 
  FilePlus, 
  GitBranch, 
  UserCheck, 
  Settings, 
  CheckCircle, 
  XCircle, 
  Users 
} from 'lucide-react';

// --- 1. 自定义卡片节点组件 (复用通用设计) ---
const ProcessCardNode = ({ data }: { data: any }) => {
  const getHeaderColor = (type: string) => {
    switch (type) {
      case 'start': return 'bg-blue-600';     // 提单
      case 'decision': return 'bg-purple-600'; // 决策
      case 'approval': return 'bg-orange-500'; // 审批
      case 'task': return 'bg-indigo-600';     // 实施
      case 'end': return 'bg-gray-500';        // 结束
      default: return 'bg-gray-700';
    }
  };

  return (
    <div className="shadow-xl rounded-lg bg-white border border-gray-200 w-80 overflow-hidden font-sans hover:shadow-2xl transition-shadow duration-300">
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-gray-500" />
      
      {/* 头部：图标 + 标题 + 角色 */}
      <div className={`${getHeaderColor(data.type)} p-3 text-white flex items-center justify-between`}>
        <div className="flex items-center gap-2 font-bold">
          {data.icon}
          <span>{data.label}</span>
        </div>
        <span className="text-xs bg-white/20 px-2 py-0.5 rounded text-white/90">
          {data.actor}
        </span>
      </div>

      {/* 内容区 */}
      <div className="p-4 text-sm text-gray-700">
        <div className="mb-3 text-xs text-gray-500 italic border-l-2 border-gray-300 pl-2">
          {data.description}
        </div>

        {/* 字段列表 */}
        {data.fields && data.fields.length > 0 && (
          <div className="bg-gray-50 rounded p-2 border border-gray-100">
            <h4 className="text-xs font-bold text-gray-400 uppercase mb-2">核心字段 / 动作</h4>
            <ul className="space-y-1.5">
              {data.fields.map((field: any, index: number) => (
                <li key={index} className="flex justify-between items-start text-xs border-b border-gray-100 last:border-0 pb-1">
                  <span className="font-medium text-gray-700">{field.name}</span>
                  {field.note && (
                    <span className="text-xs text-blue-500 ml-2 text-right max-w-[120px]">
                      {field.note}
                    </span>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* 逻辑高亮块 */}
        {data.logicNote && (
          <div className="mt-3 text-xs bg-amber-50 text-amber-800 p-2 rounded border border-amber-100 flex gap-2">
            <span className="font-bold">⚡规则:</span>
            <span>{data.logicNote}</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-gray-500" />
    </div>
  );
};

const nodeTypes = { processCard: ProcessCardNode };

// --- 2. 节点数据配置 (基于你的"邮件群组"规范) ---
const initialNodes = [
  {
    id: 'node-1',
    type: 'processCard',
    position: { x: 250, y: 0 },
    data: {
      type: 'start',
      label: '1. 需求发起',
      actor: '申请人',
      icon: <FilePlus size={16} />,
      description: '定义群组核心属性，支持未实施前撤回。',
      fields: [
        { name: '标题', note: '默认: 邮件群组创建申请' },
        { name: '紧急程度', note: '默认: 低 (Level 1)' },
        { name: '群组中/英文名', note: '自定义表格' },
        { name: '群组成员清单', note: '列表收集' },
        { name: '所属区域', note: '广/深/北/上' },
        { name: '是否永久使用', note: '默认为"是"' },
        { name: '截止使用日期', note: '仅当永久="是"时强制显示' },
        { name: '其他通知人', note: '选填协同人员' },
      ],
    },
  },
  {
    id: 'node-2',
    type: 'processCard',
    position: { x: 250, y: 500 },
    data: {
      type: 'decision',
      label: '2. 自动化路由',
      actor: '系统后台',
      icon: <GitBranch size={16} />,
      description: '基于申请人角色权限的自动分流。',
      fields: [],
      logicNote: '若申请人角色为"总监"，判定为高信任，跳过审批直接进入实施。',
    },
  },
  {
    id: 'node-3',
    type: 'processCard',
    position: { x: -50, y: 750 },
    data: {
      type: 'approval',
      label: '3. 管理合规审查',
      actor: '直属上级',
      icon: <UserCheck size={16} />,
      description: '常规员工需上级人工背书。',
      fields: [
        { name: '审批动作', note: '通过 / 拒绝' },
        { name: '备注(通过)', note: '🔴 必填 (记录理由)' },
        { name: '备注(拒绝)', note: '⚪ 选填' },
      ],
    },
  },
  {
    id: 'node-4',
    type: 'processCard',
    position: { x: 550, y: 750 },
    data: {
      type: 'task',
      label: '4. 技术落地执行',
      actor: '系统管理员组',
      icon: <Settings size={16} />,
      description: '任务到达技术池，需认领。',
      fields: [
        { name: '操作模式', note: '认领后处理' },
        { name: '实施结果', note: '富文本反馈(配置参数)' },
      ],
      logicNote: '必须填写实施结果才能结单。',
    },
  },
  {
    id: 'node-end-success',
    type: 'processCard',
    position: { x: 550, y: 1050 },
    data: {
      type: 'end',
      label: '5. 流程闭环',
      actor: '系统',
      icon: <CheckCircle size={16} />,
      description: '全程开启"可督办"模式，实施完成自动归档。',
      fields: [],
    },
  },
  {
    id: 'node-end-fail',
    type: 'processCard',
    position: { x: -50, y: 1050 },
    data: {
      type: 'end',
      label: '申请驳回',
      actor: '系统',
      icon: <XCircle size={16} />,
      description: '审批拒绝，流程终止。',
      fields: [],
    },
  },
];

// --- 3. 连线逻辑 (对应业务路径) ---
const initialEdges = [
  // 1. 提单 -> 路由
  { 
    id: 'e1-2', source: 'node-1', target: 'node-2', 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 2. 路由 -> 审批 (常规路径)
  { 
    id: 'e2-3', source: 'node-2', target: 'node-3', 
    label: '常规员工', 
    type: 'smoothstep',
    style: { stroke: '#94a3b8', strokeDasharray: '5,5' }, // 虚线表示常规
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 2. 路由 -> 实施 (总监绿色通道)
  { 
    id: 'e2-4', source: 'node-2', target: 'node-4', 
    label: '总监 (绿色通道)', 
    type: 'smoothstep',
    style: { stroke: '#10b981', strokeWidth: 2 },
    labelStyle: { fill: '#10b981', fontWeight: 800 },
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 3. 审批 -> 实施 (审批通过)
  { 
    id: 'e3-4', source: 'node-3', target: 'node-4', 
    label: '通过', 
    type: 'smoothstep',
    style: { stroke: '#10b981' },
    labelStyle: { fill: '#10b981' },
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 3. 审批 -> 结束 (审批拒绝)
  { 
    id: 'e3-fail', source: 'node-3', target: 'node-end-fail', 
    label: '拒绝', 
    type: 'smoothstep',
    style: { stroke: '#ef4444' },
    labelStyle: { fill: '#ef4444' },
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
  
  // 4. 实施 -> 成功闭环
  { 
    id: 'e4-success', source: 'node-4', target: 'node-end-success', 
    markerEnd: { type: MarkerType.ArrowClosed } 
  },
];

// --- 4. 主渲染组件 ---
export default function MailGroupProcessFlow() {
  const [nodes, , onNodesChange] = useNodesState(initialNodes);
  const [edges, , onEdgesChange] = useEdgesState(initialEdges);

  return (
    <div style={{ width: '100%', height: '100vh', background: '#f0f4f8' }}>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        fitView
        attributionPosition="bottom-right"
      >
        <MiniMap 
          nodeStrokeColor={(n) => n.type === 'processCard' ? '#cbd5e1' : '#e2e8f0'}
          nodeColor="#fff"
        />
        <Controls />
        <Background color="#94a3b8" gap={20} size={1} />
      </ReactFlow>
    </div>
  );
}
