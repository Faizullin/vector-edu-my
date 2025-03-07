import { Sidebar, Navbar, Datatable } from "~/widgets";
import "./list.scss";

export default function List() {
  return (
    <div className="list">
      <Sidebar />
      <div className="listContainer">
        <Navbar />
        <Datatable />
      </div>
    </div>
  );
}
