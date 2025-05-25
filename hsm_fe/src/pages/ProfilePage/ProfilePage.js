// import React from 'react'

// const ProfilePage = () => {
//   return (
//     <model-viewer
//       src="https://cdn.shopify.com/s/files/1/0823/2121/1739/files/3DMODEL2.gltf?v=1726023108"
//       alt="A 3D model"
//       auto-rotate
//       min-camera-orbit="auto auto 18m"
//       max-camera-orbit="auto auto 18m"
//       camera-controls
//       disable-zoom
//       environment-image="https://cdn.shopify.com/s/files/1/0823/2121/1739/files/clouds.jpg?v=1726024215"
//       skybox-image="https://cdn.shopify.com/s/files/1/0823/2121/1739/files/cloudyskyeditted.jpg?v=1726025777"
//       exposure="2.5"
//       style="width: 100%; height: 700px;">
//     </model-viewer>

//   )
// }

// export default ProfilePage


import React, { useState } from 'react';
import { User, Phone, Mail, MapPin, Calendar, Building, Shield, Edit3, Camera, Save, X } from 'lucide-react';

const ProfileLayouts = () => {
  const [activeProfile, setActiveProfile] = useState('customer');
  const [isEditing, setIsEditing] = useState(false);

  // Sample data for Customer
  const [customerData, setCustomerData] = useState({
    full_name: "Nguyễn Văn An",
    phone: "0123456789",
    cccd: "123456789012",
    email: "nguyenvanan@gmail.com",
    createdAt: "2024-01-15",
    avatar: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face"
  });

  // Sample data for Employee
  const [employeeData, setEmployeeData] = useState({
    FullName: "Trần Thị Bình",
    Phone: "0987654321",
    Email: "tranthibinh@company.com",
    Gender: "Nữ",
    Address: "123 Đường ABC, Quận 1, TP.HCM",
    Image: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    hotels: ["Khách sạn Paradise", "Resort Ocean View"],
    permission: "Quản lý",
    createdAt: "2023-08-20"
  });

  const CustomerProfile = () => (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-32 bg-gradient-to-r from-blue-600 to-indigo-700">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute -bottom-16 left-8 flex items-end space-x-6">
              <div className="relative">
                <img
                  src={customerData.avatar}
                  alt="Avatar"
                  className="w-32 h-32 rounded-full border-4 border-white shadow-lg object-cover"
                />
                <button className="absolute bottom-2 right-2 bg-blue-600 text-white p-2 rounded-full hover:bg-blue-700 transition-colors shadow-lg">
                  <Camera size={16} />
                </button>
              </div>
              <div className="pb-4">
                <h1 className="text-2xl font-bold text-white mb-1">{customerData.full_name}</h1>
                <p className="text-blue-100">Khách hàng thân thiết</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
            >
              {isEditing ? <X size={20} /> : <Edit3 size={20} />}
            </button>
          </div>
          <div className="pt-20 px-8 pb-8">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-blue-100 p-2 rounded-lg">
                    <Phone className="text-blue-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Số điện thoại</p>
                    <p className="font-semibold text-gray-800">{customerData.phone}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-green-100 p-2 rounded-lg">
                    <Mail className="text-green-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-semibold text-gray-800">{customerData.email}</p>
                  </div>
                </div>
              </div>
              <div className="space-y-4">
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-purple-100 p-2 rounded-lg">
                    <User className="text-purple-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">CCCD</p>
                    <p className="font-semibold text-gray-800">{customerData.cccd}</p>
                  </div>
                </div>
                <div className="flex items-center space-x-3 p-4 bg-gray-50 rounded-xl">
                  <div className="bg-orange-100 p-2 rounded-lg">
                    <Calendar className="text-orange-600" size={20} />
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">Ngày tham gia</p>
                    <p className="font-semibold text-gray-800">{new Date(customerData.createdAt).toLocaleDateString('vi-VN')}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng đơn hàng</p>
                <p className="text-2xl font-bold text-gray-800">24</p>
              </div>
              <div className="bg-blue-100 p-3 rounded-full">
                <Building className="text-blue-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Tổng chi tiêu</p>
                <p className="text-2xl font-bold text-gray-800">15.2M</p>
              </div>
              <div className="bg-green-100 p-3 rounded-full">
                <Calendar className="text-green-600" size={24} />
              </div>
            </div>
          </div>
          <div className="bg-white p-6 rounded-xl shadow-lg">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-500 mb-1">Điểm thưởng</p>
                <p className="text-2xl font-bold text-gray-800">1,250</p>
              </div>
              <div className="bg-yellow-100 p-3 rounded-full">
                <Shield className="text-yellow-600" size={24} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const EmployeeProfile = () => (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-teal-50 p-4">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-to-r from-emerald-600 to-teal-700">
            <div className="absolute inset-0 bg-black bg-opacity-20"></div>
            <div className="absolute -bottom-20 left-8 flex items-end space-x-6">
              <div className="relative">
                <img
                  src={employeeData.Image}
                  alt="Avatar"
                  className="w-40 h-40 rounded-full border-4 border-white shadow-xl object-cover"
                />
                <button className="absolute bottom-3 right-3 bg-emerald-600 text-white p-2 rounded-full hover:bg-emerald-700 transition-colors shadow-lg">
                  <Camera size={18} />
                </button>
              </div>
              <div className="pb-6">
                <h1 className="text-3xl font-bold text-white mb-2">{employeeData.FullName}</h1>
                <div className="flex items-center space-x-2 mb-1">
                  <Shield className="text-emerald-200" size={16} />
                  <p className="text-emerald-100 font-medium">{employeeData.permission}</p>
                </div>
                <p className="text-emerald-200">{employeeData.Gender}</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="absolute top-4 right-4 bg-white bg-opacity-20 backdrop-blur-sm text-white p-2 rounded-lg hover:bg-opacity-30 transition-all"
            >
              {isEditing ? <X size={20} /> : <Edit3 size={20} />}
            </button>
          </div>
          
          <div className="pt-24 px-8 pb-8">
            <div className="grid lg:grid-cols-3 gap-8">
              {/* Contact Info */}
              <div className="lg:col-span-2">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin liên hệ</h3>
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-r from-blue-50 to-blue-100 p-4 rounded-xl border border-blue-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-blue-500 p-2 rounded-lg">
                        <Phone className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-blue-600 font-medium">Số điện thoại</p>
                        <p className="font-semibold text-gray-800">{employeeData.Phone}</p>
                      </div>
                    </div>
                  </div>
                  <div className="bg-gradient-to-r from-green-50 to-green-100 p-4 rounded-xl border border-green-200">
                    <div className="flex items-center space-x-3">
                      <div className="bg-green-500 p-2 rounded-lg">
                        <Mail className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-green-600 font-medium">Email</p>
                        <p className="font-semibold text-gray-800">{employeeData.Email}</p>
                      </div>
                    </div>
                  </div>
                  <div className="md:col-span-2 bg-gradient-to-r from-purple-50 to-purple-100 p-4 rounded-xl border border-purple-200">
                    <div className="flex items-start space-x-3">
                      <div className="bg-purple-500 p-2 rounded-lg">
                        <MapPin className="text-white" size={18} />
                      </div>
                      <div>
                        <p className="text-sm text-purple-600 font-medium">Địa chỉ</p>
                        <p className="font-semibold text-gray-800">{employeeData.Address}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Hotels */}
                <div className="mt-6">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Khách sạn được phân công</h3>
                  <div className="space-y-3">
                    {employeeData.hotels.map((hotel, index) => (
                      <div key={index} className="bg-gradient-to-r from-orange-50 to-yellow-50 p-4 rounded-xl border border-orange-200">
                        <div className="flex items-center space-x-3">
                          <div className="bg-orange-500 p-2 rounded-lg">
                            <Building className="text-white" size={18} />
                          </div>
                          <p className="font-semibold text-gray-800">{hotel}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              {/* Sidebar */}
              <div className="space-y-6">
                <div className="bg-gray-50 p-6 rounded-xl">
                  <h3 className="text-lg font-semibold text-gray-800 mb-4">Thông tin khác</h3>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <Calendar className="text-gray-500" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Ngày tham gia</p>
                        <p className="font-medium">{new Date(employeeData.createdAt).toLocaleDateString('vi-VN')}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-3">
                      <Shield className="text-gray-500" size={16} />
                      <div>
                        <p className="text-sm text-gray-500">Quyền hạn</p>
                        <p className="font-medium">{employeeData.permission}</p>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
                  <h4 className="font-semibold text-emerald-800 mb-2">Trạng thái hoạt động</h4>
                  <div className="flex items-center space-x-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-green-700 font-medium">Đang hoạt động</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div>
      {/* Tab Navigation */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-5xl mx-auto px-4">
          <div className="flex space-x-8">
            <button
              onClick={() => setActiveProfile('customer')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeProfile === 'customer'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Customer Profile
            </button>
            <button
              onClick={() => setActiveProfile('employee')}
              className={`py-4 px-2 border-b-2 font-medium text-sm transition-colors ${
                activeProfile === 'employee'
                  ? 'border-emerald-500 text-emerald-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              Employee Profile
            </button>
          </div>
        </div>
      </div>

      {/* Profile Content */}
      {activeProfile === 'customer' ? <CustomerProfile /> : <EmployeeProfile />}
    </div>
  );
};

export default ProfileLayouts;