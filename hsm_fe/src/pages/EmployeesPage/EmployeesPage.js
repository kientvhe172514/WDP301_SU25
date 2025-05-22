import React, { useEffect, useRef, useState } from "react";
import {
  DeleteOutlined,
  EditOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import { Button, Input, Space, Table, Tag } from "antd";
import axios from "axios";

const API_URL = process.env.REACT_APP_API_URL_BACKEND;

const EmployeesPage = () => {
  const navigate = useNavigate();
  const [searchText, setSearchText] = useState("");
  const [searchedColumn, setSearchedColumn] = useState("");
  const searchInput = useRef(null);
  const [employees, setEmployees] = useState([]);

  useEffect(() => {
    axios
      .get(`${API_URL}/employee/list-employees`)
      .then((response) => {
        console.log("API Response:", response.data); // Kiểm tra dữ liệu từ API
        const dataWithKeys = response.data.map((emp, index) => ({
          ...emp,
          key: index, // Thêm key duy nhất dựa trên index
        }));
        setEmployees(dataWithKeys);
      })
      .catch((error) => {
        console.error("Error fetching employees:", error);
      });
  }, []);


  const handleSearch = (selectedKeys, confirm, dataIndex) => {
    confirm();
    setSearchText(selectedKeys[0]);
    setSearchedColumn(dataIndex);
  };

  const handleReset = (clearFilters) => {
    clearFilters();
    setSearchText("");
  };

  const getColumnSearchProps = (dataIndex) => ({
    filterDropdown: ({
      setSelectedKeys,
      selectedKeys,
      confirm,
      clearFilters,
      close,
    }) => (
      <div
        style={{
          padding: 8,
        }}
        onKeyDown={(e) => e.stopPropagation()}
      >
        <Input
          ref={searchInput}
          placeholder={`Search ${dataIndex}`}
          value={selectedKeys[0]}
          onChange={(e) =>
            setSelectedKeys(e.target.value ? [e.target.value] : [])
          }
          onPressEnter={() => handleSearch(selectedKeys, confirm, dataIndex)}
          style={{
            marginBottom: 8,
            display: "block",
          }}
        />
        <Space>
          <Button
            type="primary"
            onClick={() => handleSearch(selectedKeys, confirm, dataIndex)}
            icon={<SearchOutlined />}
            size="small"
            style={{
              width: 90,
            }}
          >
            Search
          </Button>
          <Button
            onClick={() => clearFilters && handleReset(clearFilters)}
            size="small"
            style={{
              width: 90,
            }}
          >
            Reset
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              confirm({
                closeDropdown: false,
              });
              setSearchText(selectedKeys[0]);
              setSearchedColumn(dataIndex);
            }}
          >
            Filter
          </Button>
          <Button
            type="link"
            size="small"
            onClick={() => {
              close();
            }}
          >
            close
          </Button>
        </Space>
      </div>
    ),
    filterIcon: (filtered) => (
      <SearchOutlined
        style={{
          color: filtered ? "#1677ff" : undefined,
        }}
      />
    ),
    onFilter: (value, record) =>
      record[dataIndex]
        .toString()
        .toLowerCase()
        .includes(value.toLowerCase()),
    filterDropdownProps: {
      onOpenChange(open) {
        if (open) {
          setTimeout(() => searchInput.current?.select(), 100);
        }
      },
    },
  });

  const renderAction = () => {
    return (
      <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
        <DeleteOutlined
          style={{
            color: "red",
            fontSize: "20px",
            cursor: "pointer",
          }}
        />
      </div>
    );
  };

  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Employee Name",
      dataIndex: "fullname",
      key: "fullname",
      ...getColumnSearchProps("fullname"),
      sorter: (a, b) => a.fullname.length - b.fullname.length,
      render: (text, record) => (
        <span
          style={{ color: "blue", cursor: "pointer", }}
          onClick={(e) => {
            e.stopPropagation(); // Ngăn chặn event click lan ra hàng
            navigate(`/employee-detail/${record._id}`);
          }}
        >
          {text}
        </span>
      ),
    },
    {
      title: "Email",
      dataIndex: "email",
      key: "email",
      ...getColumnSearchProps("email"),
    },
    {
      title: "Phone",
      dataIndex: "phone",
      key: "phone",
      ...getColumnSearchProps("phone"),
    },
    {
      title: "Position",
      dataIndex: "position",
      key: "position",
      ...getColumnSearchProps("position"),
      sorter: (a, b) => a.position.length - b.position.length,
    },
    {
      title: "Area",
      dataIndex: "area",
      key: "area",
      ...getColumnSearchProps("area"),
      sorter: (a, b) => a.area.length - b.area.length,
    },
    // {
    //   title: "Action",
    //   key: "action",
    //   render: renderAction,
    // },
  ];

  return (
    <div style={{ padding: "20px" }}>
      <Table
        columns={columns}
        dataSource={employees}
      // onRow={(record) => ({
      //   onClick: () => {
      //     navigate(`/employee-detail/${record._id}`);
      //   },
      //   style: { cursor: 'pointer' },
      // })}

      />
    </div>
  );
};

export default EmployeesPage;