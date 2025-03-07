import { useState } from "react";
import { Link } from "react-router-dom";
import { DataGrid, GridCellParams } from "@mui/x-data-grid";
import { userColumns, userRows } from "~/shared/datatablesource";
import "./datatable.scss";

export const Datatable = () => {
  const [data, setData] = useState(userRows);

  const handleDelete = (id: number) => {
    setData(data.filter((item) => item.id !== id));
  };

  const actionColumn = [
    {
      field: "action",
      headerName: "Действие",
      width: 200,
      renderCell: (params: GridCellParams) => {
        return (
          <div className="cellAction">
            <Link to="/users/test" style={{ textDecoration: "none" }}>
              <div className="viewButton">Посмотреть</div>
            </Link>
            <div
              className="deleteButton"
              onClick={() => handleDelete(params.row.id)}
            >
              Удалить
            </div>
          </div>
        );
      },
    },
  ];
  return (
    <div className="datatable">
      <div className="datatableTitle">
        Список пользователей
        <Link to="/users/new" className="link">
          Добавить
        </Link>
      </div>
      <DataGrid
        className="datagrid"
        rows={data}
        columns={userColumns.concat(actionColumn)}
        checkboxSelection
      />
    </div>
  );
};
