import React, { useMemo } from 'react';
import { Card, Col, Row } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { useGet } from '@/hooks/useApi';

const lessons = [
  {
    name: 'Speaking',
    icon: 'record_voice_over',
    metric: '85%',
    label: 'Completed',
    key: 'speaking'
  },
  {
    name: 'Listening',
    icon: 'headset',
    metric: '72%',
    label: 'Progress',
    key: 'listening'
  },
  {
    name: 'Reading',
    icon: 'menu_book',
    metric: '92%',
    label: 'Score',
    key: 'reading'
  },
  {
    name: 'Writing',
    icon: 'edit_note',
    metric: '66%',
    label: 'Attempts',
    key: 'writing'
  }
];

const LessonsLessonBatchPage = () => {
  const listControl = useGet(`/lms/lessons/batches`, {
    useInitial: true,
    usePagination: false
  });
  const batches = useMemo(() => {
    return listControl.data
      ? listControl.data.map((item) => {
          const found = lessons.find((lesson) => lesson.key === item.title);
          const url = `/lessons/lessons?batch_id=${item.id}`;
          if (found) {
            return {
              id: item.id,
              icon: found.icon,
              metric: null,
              name: item.title,
              url
            };
          }
          return {
            id: item.id,
            icon: null,
            metric: null,
            name: item.title,
            url
          };
        })
      : [];
  }, [listControl.data]);
  return (
    <Row>
      <Col md={12}>
        <Card className="flat-card p-3">
          <Row className="g-3">
            {batches.map((batch, index) => (
              <Col as={Link} sm={6} lg={3} key={index} to={batch.url}>
                <Card className="h-100 shadow-sm border-0 text-center">
                  <Card.Body>
                    <div className="d-flex flex-column align-items-center">
                      <i className="material-icons-two-tone text-primary mb-2" style={{ fontSize: '32px' }}>
                        {batch.icon}
                      </i>
                      <h5 className="mb-1">{batch.metric}</h5>
                      <span className="text-muted">
                        {batch.name} - {batch.label}
                      </span>
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
        </Card>
      </Col>
    </Row>
  );
};

export default LessonsLessonBatchPage;
