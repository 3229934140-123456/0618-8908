import type { FamilyMember } from '@/types'

export const members: FamilyMember[] = [
  {
    id: 'member-001',
    name: '张伟',
    avatar: '',
    role: 'admin',
    online: true,
    permissions: {
      deviceIds: ['dev-001', 'dev-002', 'dev-003', 'dev-004', 'dev-005', 'dev-006', 'dev-007', 'dev-008', 'dev-009', 'dev-010', 'dev-011', 'dev-012'],
      canCreateScene: true,
      canManageMembers: true,
    },
  },
  {
    id: 'member-002',
    name: '李娜',
    avatar: '',
    role: 'member',
    online: true,
    permissions: {
      deviceIds: ['dev-001', 'dev-002', 'dev-003', 'dev-004', 'dev-005', 'dev-007', 'dev-008', 'dev-010', 'dev-011'],
      canCreateScene: true,
      canManageMembers: false,
    },
  },
  {
    id: 'member-003',
    name: '张小明',
    avatar: '',
    role: 'member',
    online: false,
    permissions: {
      deviceIds: ['dev-001', 'dev-002', 'dev-004', 'dev-011'],
      canCreateScene: false,
      canManageMembers: false,
    },
  },
  {
    id: 'member-004',
    name: '张小红',
    avatar: '',
    role: 'member',
    online: false,
    permissions: {
      deviceIds: ['dev-001', 'dev-002', 'dev-004'],
      canCreateScene: false,
      canManageMembers: false,
    },
  },
]
