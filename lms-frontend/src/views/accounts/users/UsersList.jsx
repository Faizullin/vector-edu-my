import { Col, Row } from 'react-bootstrap';
import MainCard from '@/components/Card/MainCard';
import DataTable from '@/components/table/DataTable';
import { useGet } from '@/hooks/useApi';
import { useCallback, useMemo } from 'react';

const baseUrl = '/lms/accounts/users';

export default function UsersList() {
  const listUrl = `${baseUrl}/`;
  const listControl = useGet(listUrl, {
    useInitial: true,
    usePagination: true
  });
  const columns = useMemo(() => {
    return [
      {
        key: 'id',
        label: 'Id',
        sortable: true
      },
      {
        key: 'username',
        label: 'Username'
      },
      {
        key: 'email',
        label: 'Email'
      }
    ];
  }, []);
  const handleFilterChange = useCallback(
    (filter) => {
      listControl.fetchData(filter);
    },
    [listControl.fetchData]
  );
  return (
    <Row>
      <Col sm={12}>
        <MainCard title="Users">
          <div className="align-items-center m-l-0 row">
            <div className="col-sm-6"></div>
            <div className="text-end col-sm-6">
              {/*<button type="button" className="btn-sm btn-round mb-3 btn btn-success" onClick={handleCreate}>*/}
              {/*  <i className="feather icon-plus"></i> Add*/}
              {/*</button>*/}
            </div>
          </div>
          <DataTable
            columns={columns}
            control={listControl}
            extraActions={(_) => <>{/*<Dropdown.Item onClick={() => handlePagesView(row)}>Pages View</Dropdown.Item>*/}</>}
            onFilterChange={handleFilterChange}
          />
        </MainCard>
      </Col>
    </Row>
  );
}
