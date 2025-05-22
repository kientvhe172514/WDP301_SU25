import React, { useEffect, useState } from "react";
import { Tag, Spin, Select } from "antd";
import axios from "axios";
import {
  StyledContainer,
  StyledTitle,
  StyledTable,
  StyledSelectContainer,
  StyledSelect
} from "./styles";


const { Option } = Select;


const HousekeepingHistory = () => {
  const [tasks, setTasks] = useState([]);
  const [localHotels, setLocalHotels] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [selectedLocalHotel, setSelectedLocalHotel] = useState(null);
  const [selectedHotel, setSelectedHotel] = useState(null);
  const [loading, setLoading] = useState(false);


  // Fetch danh sách LocalHotels
  useEffect(() => {
    const fetchLocalHotels = async () => {
      try {
        const response = await axios.get("http://localhost:9999/api/housekeeping/localhotels");
        setLocalHotels(response.data);
      } catch (error) {
        console.error("Error fetching local hotels:", error);
      }
    };
    fetchLocalHotels();
  }, []);


  // Fetch danh sách Hotels theo LocalHotel đã chọn
  useEffect(() => {
    if (!selectedLocalHotel) return;
    const fetchHotels = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/api/housekeeping/hotels/by-location?location=${selectedLocalHotel}`);
        setHotels(response.data);
      } catch (error) {
        console.error("Error fetching hotels:", error);
      }
    };
    fetchHotels();
  }, [selectedLocalHotel]);


  // Fetch Task theo Hotel đã chọn
  useEffect(() => {
    if (!selectedHotel) return;
    setLoading(true);
    const fetchTasks = async () => {
      try {
        const response = await axios.get(`http://localhost:9999/api/housekeeping/list?hotelId=${selectedHotel}`);
        setTasks(response.data);
      } catch (error) {
        console.error("Error fetching housekeeping tasks:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchTasks();
  }, [selectedHotel]);


  const columns = [
    {
      title: "ID",
      key: "index",
      render: (text, record, index) => index + 1,
    },
    {
      title: "Employee",
      dataIndex: "assignedTo",
      key: "assignedTo",
      render: (assignedTo) => assignedTo?.Username || "N/A",
    },
    {
      title: "Room",
      dataIndex: "room",
      key: "room",
      render: (room) => room?.RoomName || "N/A",
    },
    {
      title: "Type",
      dataIndex: "taskType",
      key: "taskType",
    },
    {
      title: "Status",
      dataIndex: "status",
      key: "status",
      render: (status) => {
        let color = status === "Completed" ? "green" : status === "In Progress" ? "blue" : "red";
        return <Tag color={color}>{status}</Tag>;
      },
    },
    {
      title: "Reason for Cancellation (if any)",
      dataIndex: "notes",
      key: "notes",
      render: (notes) => notes || "N/A",
    },
  ];


  return (
    <StyledContainer>
      <StyledTitle>Housekeeping Task History</StyledTitle>


      {/* Dropdowns để chọn LocalHotel và Hotel */}
      <StyledSelectContainer>
        <StyledSelect
          placeholder="Select LocalHotel"
          onChange={(value) => {
            setSelectedLocalHotel(value);
            setSelectedHotel(null);
          }}
        >
          {localHotels.map((location) => (
            <Option key={location} value={location}>
              {location}
            </Option>
          ))}
        </StyledSelect>


        <StyledSelect
          placeholder="Select Hotel"
          value={selectedHotel}
          onChange={(value) => setSelectedHotel(value)}
          disabled={!selectedLocalHotel}
        >
          {hotels.map((hotel) => (
            <Option key={hotel._id} value={hotel._id}>
              {hotel.NameHotel}
            </Option>
          ))}
        </StyledSelect>
      </StyledSelectContainer>


      {/* Bảng hiển thị danh sách Task */}
      {loading ? <Spin size="large" /> : <StyledTable columns={columns} dataSource={tasks} rowKey="_id" />}
    </StyledContainer>
  );
};


export default HousekeepingHistory;
