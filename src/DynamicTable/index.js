import { useState } from "react";
import "./DynamicTable.css";

function DynamicTable() {
  const [tableColumns, setTableColumns] = useState([
    {
      header: "name",
      columnData: ["adidas", "nike", "puma", "reebok"],
    },
    {
      header: "founded",
      columnData: ["1949", "1964", "1948", "1958"],
    },
    {
      header: "origin",
      columnData: ["Germany", "", "Germany", "USA"],
    },
  ]);
  const handleChange = (e, type, colIndex, rowIndex) => {
    if (type === "thead") {
      let newArr = [...tableColumns];
      newArr[colIndex].header = e.target.value;
      setTableColumns(newArr);
    } else {
      let newArr = [...tableColumns];
      newArr[colIndex].columnData[rowIndex] = e.target.value;
      setTableColumns(newArr);
    }
  };

  const addRow = () => {
    let newArr = [...tableColumns];
    tableColumns.map((item) => item.columnData.push(""));
    setTableColumns(newArr);
  };
  const addColumn = () => {
    let newArr = [...tableColumns];
    newArr.push(tableColumns[tableColumns.length - 1]);
    setTableColumns(newArr);
  };

  const removeRow = (index) => {
    let newArr = [...tableColumns];
    tableColumns.map((item) => item.columnData.splice(index, 1));
    setTableColumns(newArr);
  };
  const removeColumn = (index) => {
    let newArr = [...tableColumns];
    newArr.splice(index, 1);
    setTableColumns(newArr);
  };

  return (
    <div className="table-container">
      <table border="1">
        <thead>
          <tr>
            {tableColumns.map((item, colIndex) => (
              <th>
                <input
                  type="text"
                  value={item.header}
                  onChange={(e) => handleChange(e, "thead", colIndex)}
                />
                <button onClick={(e) => removeColumn(colIndex)}>-</button>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableColumns[0].columnData.map((item, rowIndex) => (
            <tr>
              {tableColumns.map((item, colIndex) => (
                <td>
                  <input
                    type="text"
                    value={item.columnData[rowIndex]}
                    onChange={(e) =>
                      handleChange(e, "tbody", colIndex, rowIndex)
                    }
                  />
                </td>
              ))}
              <button onClick={(e) => removeRow(rowIndex)}>-</button>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="buttons-wrapper">
        <button onClick={addRow}>Add Row</button>
        <button onClick={addColumn}>Add Column</button>
      </div>
    </div>
  );
}

export default DynamicTable;
