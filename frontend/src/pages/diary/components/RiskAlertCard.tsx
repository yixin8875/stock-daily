import React from 'react'
import { Card, Checkbox, Input, Row, Col, Typography } from 'antd'
import { RISK_TYPES } from '@/types/diary'
import type { RiskType } from '@/types/diary'
import { useDiaryStore } from '@/stores/diaryStore'

const { TextArea } = Input
const { Text } = Typography

const RiskAlertCard: React.FC = () => {
  const { riskAlert, setRiskAlert } = useDiaryStore()

  const handleRiskTypesChange = (checkedValues: string[]) => {
    setRiskAlert({ riskTypes: checkedValues as RiskType[] })
  }

  return (
    <Card title="风险提示" style={{ marginBottom: 16 }}>
      <Row gutter={[16, 16]}>
        <Col span={24}>
          <Text strong>风险类型</Text>
          <div style={{ marginTop: 8 }}>
            <Checkbox.Group
              value={riskAlert.riskTypes}
              onChange={handleRiskTypesChange}
              options={RISK_TYPES.map((item) => ({ label: item.label, value: item.value }))}
            />
          </div>
        </Col>
        <Col span={24}>
          <Text strong>风险描述</Text>
          <TextArea
            value={riskAlert.description}
            onChange={(e) => setRiskAlert({ description: e.target.value })}
            placeholder="描述当前面临的风险情况..."
            rows={3}
            style={{ marginTop: 8 }}
          />
        </Col>
        <Col span={24}>
          <Text strong>应对措施</Text>
          <TextArea
            value={riskAlert.countermeasures}
            onChange={(e) => setRiskAlert({ countermeasures: e.target.value })}
            placeholder="针对上述风险的应对措施..."
            rows={3}
            style={{ marginTop: 8 }}
          />
        </Col>
      </Row>
    </Card>
  )
}

export default RiskAlertCard