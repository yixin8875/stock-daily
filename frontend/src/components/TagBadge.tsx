import React from 'react'
import { Tag } from 'antd'

interface TagBadgeProps {
  name: string
  color: string
  closable?: boolean
  onClose?: () => void
  onClick?: () => void
  style?: React.CSSProperties
}

const TagBadge: React.FC<TagBadgeProps> = ({
  name,
  color,
  closable = false,
  onClose,
  onClick,
  style,
}) => {
  return (
    <Tag
      color={color}
      closable={closable}
      onClose={onClose}
      onClick={onClick}
      style={{
        cursor: onClick ? 'pointer' : 'default',
        ...style,
      }}
    >
      {name}
    </Tag>
  )
}

export default TagBadge
