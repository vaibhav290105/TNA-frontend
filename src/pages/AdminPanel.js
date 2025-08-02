"use client"

import { useEffect, useState, useCallback, useMemo } from "react"
import API from "../services/api"
import { Link, useNavigate } from "react-router-dom"
import {
  Search,
  Plus,
  Users,
  FileText,
  UserCheck,
  X,
  Check,
  Eye,
  LogOut,
  User,
  Filter,
  ChevronDown,
  Building,
  Mail,
  MapPin,
  Calendar,
  Badge,
} from "lucide-react"

export default function AdminPanel() {
  const [activeTab, setActiveTab] = useState("training")
  const [title, setTitle] = useState("")
  const [questions, setQuestions] = useState([""])
  const [users, setUsers] = useState([])
  const [selectedUsers, setSelectedUsers] = useState([])
  const [surveys, setSurveys] = useState([])
  const [success, setSuccess] = useState("")
  const [trainingRequests, setTrainingRequests] = useState([])
  const [selectedRequest, setSelectedRequest] = useState(null)
  const [selectedManager, setSelectedManager] = useState("")
  const [managerMapDept, setManagerMapDept] = useState("")
  const [mappedEmployees, setMappedEmployees] = useState([])
  const [searchId, setSearchId] = useState("")
  const [filterDept, setFilterDept] = useState("")
  const [searchResult, setSearchResult] = useState(null)
  const [filterName, setFilterName] = useState("")
  const [filterEmail, setFilterEmail] = useState("")
  const [filterLocation, setFilterLocation] = useState("")
  const [isSearchTriggered, setIsSearchTriggered] = useState(false)
  const [surveySearch, setSurveySearch] = useState("")
  const [filterRole, setFilterRole] = useState("")
  const [loading, setLoading] = useState(false)
  const [showFilters, setShowFilters] = useState(false)

  const navigate = useNavigate()

  const fetchUsers = useCallback(() => {
    setLoading(true)
    API.get("/auth/users")
      .then((res) => {
        const nonAdmins = res.data.filter((user) => user.role !== "admin")
        setUsers(nonAdmins)
      })
      .catch(() => alert("Failed to fetch users"))
      .finally(() => setLoading(false))
  }, [])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  useEffect(() => {
    if (activeTab === "survey") {
      API.get("/survey/created")
        .then((res) => setSurveys(res.data))
        .catch(() => console.error("Failed to load created surveys"))
    }
  }, [success, activeTab])

  const fetchMappedEmployees = useCallback(async (managerId) => {
    try {
      const res = await API.get(`/auth/users/manager/${managerId}`)
      setMappedEmployees(res.data)
    } catch (err) {
      console.error("Failed to fetch mapped employees:", err)
    }
  }, [])

  useEffect(() => {
    if (activeTab === "training") {
      setLoading(true)
      API.get("/training-request/all")
        .then((res) => setTrainingRequests(res.data))
        .catch(() => alert("Failed to fetch training requests"))
        .finally(() => setLoading(false))
    }
  }, [activeTab])

  useEffect(() => {
    if (!searchId.trim()) {
      setSearchResult(null)
    }
  }, [searchId])

  useEffect(() => {
    if (isSearchTriggered) {
      setSearchResult(null)
      setIsSearchTriggered(false)
    }
  }, [filterDept, filterName, filterEmail, filterLocation])

  const addQuestion = () => setQuestions([...questions, ""])

  const updateQuestion = (index, value) => {
    const copy = [...questions]
    copy[index] = value
    setQuestions(copy)
  }

  const removeQuestion = (index) => {
    if (questions.length > 1) {
      const copy = questions.filter((_, i) => i !== index)
      setQuestions(copy)
    }
  }

  const toggleUser = (id) => {
    setSelectedUsers((prev) => (prev.includes(id) ? prev.filter((uid) => uid !== id) : [...prev, id]))
  }

  const createSurvey = async () => {
    if (!title || questions.some((q) => !q)) return alert("Fill all fields")
    setLoading(true)
    try {
      await API.post("/survey/create", {
        title,
        questions,
        assignedTo: selectedUsers,
      })
      setTitle("")
      setQuestions([""])
      setSelectedUsers([])
      setSuccess("Survey created successfully!")
      setTimeout(() => setSuccess(""), 3000)
    } catch (err) {
      alert("Survey creation failed")
    } finally {
      setLoading(false)
    }
  }

  const updateStatus = async (id, decision) => {
    setLoading(true)
    try {
      await API.patch(`/training-request/admin-review/${id}`, { decision })

      const updated = trainingRequests.map((r) =>
        r._id === id
          ? {
              ...r,
              status: decision === "approve" ? "Approved_By_Admin" : "Rejected_By_Admin",
            }
          : r,
      )
      setTrainingRequests(updated)

      if (searchResult && searchResult._id === id) {
        setSearchResult({
          ...searchResult,
          status: decision === "approve" ? "Approved_By_Admin" : "Rejected_By_Admin",
        })
      }
    } catch (err) {
      alert("Failed to update status")
    } finally {
      setLoading(false)
    }
  }

  const formatStatus = (status) => {
    switch (status) {
      case "Approved_By_Admin":
        return { label: "Approved by Admin", color: "bg-emerald-100 text-emerald-800 border-emerald-200" }
      case "Rejected_By_Admin":
        return { label: "Rejected by Admin", color: "bg-red-100 text-red-800 border-red-200" }
      case "Approved_By_Manager":
        return { label: "Approved by Manager", color: "bg-blue-100 text-blue-800 border-blue-200" }
      case "Rejected_By_Manager":
        return { label: "Rejected by Manager", color: "bg-orange-100 text-orange-800 border-orange-200" }
      case "Pending_Manager":
        return { label: "Pending Manager Review", color: "bg-yellow-100 text-yellow-800 border-yellow-200" }
      default:
        return { label: status, color: "bg-gray-100 text-gray-800 border-gray-200" }
    }
  }

  const logout = () => {
    localStorage.clear()
    navigate("/")
  }

  const handleUnmap = async (employeeId) => {
    if (!selectedManager) {
      alert("Please select a manager first.")
      return
    }

    setLoading(true)
    try {
      await API.patch(`/auth/users/${employeeId}/unassign-manager`, {
        managerId: selectedManager,
      })
      alert("Unmapped successfully")
      await fetchUsers()
      await fetchMappedEmployees(selectedManager)
    } catch (err) {
      alert("Failed to unmap")
    } finally {
      setLoading(false)
    }
  }

  const handleMap = async (employeeId) => {
    if (!selectedManager) {
      alert("Please select a manager first.")
      return
    }

    setLoading(true)
    try {
      await API.patch(`/auth/users/${employeeId}/assign-manager`, {
        managerId: selectedManager,
      })
      alert("Mapped successfully")
      await fetchUsers()
      await fetchMappedEmployees(selectedManager)
    } catch (err) {
      alert("Failed to map")
    } finally {
      setLoading(false)
    }
  }

  const handleSearch = async () => {
    if (!searchId.trim()) return
    setLoading(true)
    try {
      const res = await API.get(`/training-request/admin/${searchId}`)
      setSearchResult(res.data)
      setIsSearchTriggered(true)
    } catch {
      alert("Request not found")
      setSearchResult(null)
      setIsSearchTriggered(false)
    } finally {
      setLoading(false)
    }
  }

  const departments = useMemo(() => [...new Set(users.map((u) => u.department))], [users])
  const roles = useMemo(() => [...new Set(users.map((u) => u.role))], [users])

  const filteredRequests = useMemo(() => {
    const baseList = isSearchTriggered && searchResult ? [searchResult] : trainingRequests

    return baseList.filter((r) => {
      if (isSearchTriggered && searchResult) return true

      return (
        (!filterDept || r.user?.department?.toLowerCase() === filterDept.toLowerCase()) &&
        (!filterName || r.user?.name?.toLowerCase().includes(filterName.toLowerCase())) &&
        (!filterEmail || r.user?.email?.toLowerCase().includes(filterEmail.toLowerCase())) &&
        (!filterLocation || r.user?.location?.toLowerCase().includes(filterLocation.toLowerCase()))
      )
    })
  }, [trainingRequests, searchResult, isSearchTriggered, filterDept, filterName, filterEmail, filterLocation])

  const filteredSurveys = useMemo(
    () => surveys.filter((survey) => survey.title.toLowerCase().includes(surveySearch.toLowerCase())),
    [surveys, surveySearch],
  )

  const TabButton = ({ id, label, icon: Icon, isActive, onClick }) => (
    <button
      onClick={onClick}
      className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
        isActive
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg transform scale-105"
          : "bg-white text-gray-600 hover:bg-gray-50 hover:text-gray-800 shadow-md hover:shadow-lg"
      }`}
    >
      <Icon size={18} />
      {label}
    </button>
  )

  const LoadingSpinner = () => (
    <div className="flex items-center justify-center py-8">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
    </div>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Modern Header */}
      <header className="bg-white shadow-lg border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center">
                <img
                  src="https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ5K42hVGPlbGNM1cnJt7_vKICraUbzYmmlcA&s"
                  alt="IGL Logo"
                  className="h-8 w-8 object-contain"
                />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-sm text-gray-600">Indraprastha Gas Limited</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => navigate("/profile")}
                className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <User size={16} />
                Profile
              </button>
              <button
                onClick={logout}
                className="flex items-center gap-2 bg-red-50 hover:bg-red-100 text-red-700 px-4 py-2 rounded-lg font-medium transition-colors"
              >
                <LogOut size={16} />
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto p-6">
        {/* Modern Tab Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          <TabButton
            id="survey"
            label="Feedback Form Management"
            icon={FileText}
            isActive={activeTab === "survey"}
            onClick={() => setActiveTab("survey")}
          />
          <TabButton
            id="training"
            label="Training Requests"
            icon={Badge}
            isActive={activeTab === "training"}
            onClick={() => setActiveTab("training")}
          />
          <TabButton
            id="mapping"
            label="Employee Management"
            icon={Users}
            isActive={activeTab === "mapping"}
            onClick={() => setActiveTab("mapping")}
          />
        </div>

        {/* Employee Management Tab */}
        {activeTab === "mapping" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <div className="flex items-center gap-3 mb-6">
              <Users className="text-purple-600" size={24} />
              <h2 className="text-2xl font-bold text-gray-900">Employee Management</h2>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">Select Department</label>
              <select
                onChange={(e) => setManagerMapDept(e.target.value)}
                className="w-full md:w-64 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-purple-500 focus:border-transparent"
              >
                <option value="">Choose Department</option>
                {departments.map((dep) => (
                  <option key={dep} value={dep}>
                    {dep}
                  </option>
                ))}
              </select>
            </div>

            {managerMapDept && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Managers Card */}
                <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-xl p-6 border border-blue-200">
                  <h3 className="text-lg font-bold text-blue-900 mb-4 flex items-center gap-2">
                    <UserCheck size={20} />
                    Managers
                  </h3>
                  <div className="space-y-3">
                    {users
                      .filter((u) => u.department === managerMapDept && u.role === "manager")
                      .map((manager) => (
                        <div
                          key={manager._id}
                          className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                        >
                          <span className="font-medium text-gray-800">{manager.name}</span>
                          <button
                            className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 text-sm rounded-lg transition-colors"
                            onClick={() => {
                              setSelectedManager(manager._id)
                              fetchMappedEmployees(manager._id)
                            }}
                          >
                            Select
                          </button>
                        </div>
                      ))}
                  </div>
                </div>

                {/* Employees Card */}
                <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-xl p-6 border border-green-200">
                  <h3 className="text-lg font-bold text-green-900 mb-4 flex items-center gap-2">
                    <Users size={20} />
                    Employees
                  </h3>
                  <div className="space-y-3">
                    {users
                      .filter((u) => u.department === managerMapDept && u.role === "employee")
                      .map((employee) => {
                        const assignedManager = users.find((m) => m._id === employee.manager)
                        return (
                          <div key={employee._id} className="p-3 bg-white rounded-lg shadow-sm">
                            <div className="flex justify-between items-start mb-2">
                              <span className="font-medium text-gray-800">{employee.name}</span>
                              {!employee.manager ? (
                                <button
                                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 text-sm rounded-lg transition-colors"
                                  onClick={() => handleMap(employee._id)}
                                  disabled={loading}
                                >
                                  Map
                                </button>
                              ) : (
                                <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">Assigned</span>
                              )}
                            </div>
                            {assignedManager && (
                              <p className="text-xs text-gray-600">Assigned to {assignedManager.name}</p>
                            )}
                          </div>
                        )
                      })}
                  </div>
                </div>

                {/* Mapped Employees Card */}
                <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-xl p-6 border border-purple-200">
                  <h3 className="text-lg font-bold text-purple-900 mb-4">
                    {selectedManager
                      ? `Mapped to ${users.find((u) => u._id === selectedManager)?.name || "Selected Manager"}`
                      : "Selected Manager"}
                  </h3>

                  <div className="space-y-3">
                    {!selectedManager ? (
                      <p className="text-center text-gray-500 italic py-8">Select a manager to view mappings</p>
                    ) : mappedEmployees.length === 0 ? (
                      <p className="text-center text-gray-500 italic py-8">No employees assigned yet</p>
                    ) : (
                      mappedEmployees.map((emp) => (
                        <div
                          key={emp._id}
                          className="flex justify-between items-center p-3 bg-white rounded-lg shadow-sm"
                        >
                          <span className="font-medium text-gray-800">{emp.name}</span>
                          <button
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 text-sm rounded-lg transition-colors"
                            onClick={() => handleUnmap(emp._id)}
                            disabled={loading}
                          >
                            Unmap
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Survey Management Tab */}
        {activeTab === "survey" && (
          <div className="space-y-6">
            {success && (
              <div className="bg-green-50 border border-green-200 text-green-800 px-6 py-4 rounded-xl flex items-center gap-3">
                <Check className="text-green-600" size={20} />
                {success}
              </div>
            )}

            {/* Survey Creation Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center gap-3 mb-6">
                <FileText className="text-blue-600" size={24} />
                <h2 className="text-2xl font-bold text-gray-900">Create Feedback Form</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Form Title</label>
                  <input
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Enter form title"
                    className="w-full border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Questions</label>
                  <div className="space-y-3">
                    {questions.map((q, i) => (
                      <div key={i} className="flex gap-2">
                        <input
                          value={q}
                          onChange={(e) => updateQuestion(i, e.target.value)}
                          placeholder={`Question ${i + 1}`}
                          className="flex-1 border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        />
                        {questions.length > 1 && (
                          <button
                            onClick={() => removeQuestion(i)}
                            className="bg-red-100 hover:bg-red-200 text-red-600 p-3 rounded-lg transition-colors"
                          >
                            <X size={16} />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={addQuestion}
                    className="mt-3 flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2 rounded-lg transition-colors"
                  >
                    <Plus size={16} />
                    Add Question
                  </button>
                </div>

                {/* User Assignment */}
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Assign to Users</h3>

                  {/* Filters */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    <select
                      value={filterDept}
                      onChange={(e) => setFilterDept(e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Departments</option>
                      {departments.map((dep) => (
                        <option key={dep} value={dep}>
                          {dep}
                        </option>
                      ))}
                    </select>
                    <select
                      value={filterRole}
                      onChange={(e) => setFilterRole(e.target.value)}
                      className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      <option value="">All Roles</option>
                      {roles.map((role) => (
                        <option key={role} value={role}>
                          {role}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* User List */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg bg-gray-50 p-4">
                    {departments
                      .filter((dep) => !filterDept || dep === filterDept)
                      .map((dep) => (
                        <div key={dep} className="mb-4">
                          <h4 className="font-semibold text-gray-800 mb-2 flex items-center gap-2">
                            <Building size={16} />
                            {dep}
                          </h4>
                          <div className="ml-6 space-y-2">
                            {users
                              .filter((user) => user.department === dep && (!filterRole || user.role === filterRole))
                              .map((user) => (
                                <label
                                  key={user._id}
                                  className="flex items-center gap-3 p-2 hover:bg-white rounded-lg cursor-pointer"
                                >
                                  <input
                                    type="checkbox"
                                    checked={selectedUsers.includes(user._id)}
                                    onChange={() => toggleUser(user._id)}
                                    className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                                  />
                                  <span className="text-gray-700">{user.name}</span>
                                  <span className="text-xs text-gray-500 bg-gray-200 px-2 py-1 rounded">
                                    {user.role}
                                  </span>
                                </label>
                              ))}
                          </div>
                        </div>
                      ))}
                  </div>
                </div>

                <button
                  onClick={createSurvey}
                  disabled={loading}
                  className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-6 py-3 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {loading ? <LoadingSpinner /> : <Check size={18} />}
                  Create Feedback Form
                </button>
              </div>
            </div>

            {/* Created Surveys */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Created Feedback Forms</h2>

              <div className="mb-4">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    placeholder="Search feedback forms by title..."
                    value={surveySearch}
                    onChange={(e) => setSurveySearch(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredSurveys.map((survey) => (
                  <div
                    key={survey._id}
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow bg-gray-50"
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">{survey.title}</h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <Users size={14} />
                            Assigned: {survey.assignedTo?.length || 0}
                          </span>
                          <span className="flex items-center gap-1">
                            <FileText size={14} />
                            Responses: {survey.responseCount || 0}
                          </span>
                        </div>
                      </div>
                      <Link
                        to={`/survey/${survey._id}/responses`}
                        className="flex items-center gap-2 bg-blue-50 hover:bg-blue-100 text-blue-700 px-4 py-2 rounded-lg font-medium transition-colors"
                      >
                        <Eye size={16} />
                        View Responses
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Training Requests Tab */}
        {activeTab === "training" && (
          <div className="space-y-6">
            {/* Filters and Search */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900">Filters & Search</h3>
                <button
                  onClick={() => setShowFilters(!showFilters)}
                  className="flex items-center gap-2 text-gray-600 hover:text-gray-800"
                >
                  <Filter size={16} />
                  <ChevronDown
                    className={`transform transition-transform ${showFilters ? "rotate-180" : ""}`}
                    size={16}
                  />
                </button>
              </div>

              <div className={`space-y-4 ${showFilters ? "block" : "hidden"}`}>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <select
                    value={filterDept}
                    onChange={(e) => setFilterDept(e.target.value)}
                    className="border border-gray-300 rounded-lg p-3 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  >
                    <option value="">All Departments</option>
                    {departments.map((dep) => (
                      <option key={dep} value={dep}>
                        {dep}
                      </option>
                    ))}
                  </select>

                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by Name"
                      value={filterName}
                      onChange={(e) => setFilterName(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by Email"
                      value={filterEmail}
                      onChange={(e) => setFilterEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>

                  <div className="relative">
                    <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                    <input
                      type="text"
                      placeholder="Search by Location"
                      value={filterLocation}
                      onChange={(e) => setFilterLocation(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              {/* ID Search */}
              <div className="flex gap-3 mt-4">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={16} />
                  <input
                    type="text"
                    placeholder="Enter Request ID"
                    value={searchId}
                    onChange={(e) => setSearchId(e.target.value)}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                </div>
                <button
                  onClick={handleSearch}
                  disabled={loading}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-medium transition-colors disabled:opacity-50 flex items-center gap-2"
                >
                  {loading ? <LoadingSpinner /> : <Search size={16} />}
                  Search
                </button>
              </div>
            </div>

            {/* Training Requests Table */}
            <div className="bg-white rounded-xl shadow-lg overflow-hidden">
              <div className="p-6 border-b border-gray-200">
                <div className="flex items-center gap-3">
                  <Badge className="text-green-600" size={24} />
                  <h2 className="text-2xl font-bold text-gray-900">Employee Training Requests</h2>
                </div>
              </div>

              {loading ? (
                <LoadingSpinner />
              ) : filteredRequests.length === 0 ? (
                <div className="p-8 text-center text-gray-500">
                  <Badge size={48} className="mx-auto mb-4 text-gray-300" />
                  <p className="text-lg">No training requests found</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Employee
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Department
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Role
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Request ID
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Status
                        </th>
                        <th className="px-6 py-4 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {filteredRequests.map((req) => {
                        const { label, color } = formatStatus(req.status)
                        return (
                          <tr key={req._id} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                                  <User size={16} className="text-blue-600" />
                                </div>
                                <div className="ml-3">
                                  <div className="text-sm font-medium text-gray-900">{req.user?.name}</div>
                                </div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                              {req.user?.department}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{req.user?.role}</td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-mono text-gray-900">
                              {req.requestNumber}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span
                                className={`inline-flex px-3 py-1 text-xs font-semibold rounded-full border ${color}`}
                              >
                                {label}
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                              <button
                                onClick={() => updateStatus(req._id, "approve")}
                                disabled={loading}
                                className="bg-green-100 hover:bg-green-200 text-green-800 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Approve
                              </button>
                              <button
                                onClick={() => updateStatus(req._id, "reject")}
                                disabled={loading}
                                className="bg-red-100 hover:bg-red-200 text-red-800 px-3 py-1 rounded-lg transition-colors disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <button
                                onClick={() => setSelectedRequest(req)}
                                className="text-blue-600 hover:text-blue-800 font-medium"
                              >
                                View
                              </button>
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Request Details Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden">
            <div className="p-6 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-blue-100">
              <div className="flex justify-between items-center">
                <h3 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                  <FileText className="text-blue-600" size={24} />
                  Training Request Details
                </h3>
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="text-gray-400 hover:text-gray-600 transition-colors"
                >
                  <X size={24} />
                </button>
              </div>
            </div>

            <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Employee Information */}
                <div className="space-y-4">
                  <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg">
                    <User className="text-blue-600" size={16} />
                    <span className="font-medium">Employee:</span>
                    <span>{selectedRequest.user?.name}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Building className="text-gray-600" size={16} />
                    <span className="font-medium">Department:</span>
                    <span>{selectedRequest.user?.department}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <MapPin className="text-gray-600" size={16} />
                    <span className="font-medium">Location:</span>
                    <span>{selectedRequest.user?.location}</span>
                  </div>
                </div>

                {/* Request Information */}
                <div className="space-y-4">
                  <div className="p-3 bg-green-50 rounded-lg">
                    <span className="font-medium">Status:</span>
                    <span
                      className={`ml-2 px-2 py-1 text-xs rounded-full ${formatStatus(selectedRequest.status).color}`}
                    >
                      {formatStatus(selectedRequest.status).label}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Badge className="text-gray-600" size={16} />
                    <span className="font-medium">Request No:</span>
                    <span className="font-mono">{selectedRequest.requestNumber}</span>
                  </div>
                  <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                    <Calendar className="text-gray-600" size={16} />
                    <span className="font-medium">Date Submitted:</span>
                    <span>{new Date(selectedRequest.createdAt).toLocaleDateString()}</span>
                  </div>
                </div>
              </div>

              {/* Training Details */}
              <div className="mt-8">
                <h4 className="text-lg font-bold text-gray-900 mb-4">Training Details</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                  {(() => {
                    const detailLabels = {
                      generalSkills: "Skills to Improve",
                      toolsTraining: "Tools for Training",
                      softSkills: "Soft Skills Training",
                      confidenceLevel: "Tool Confidence Level",
                      technicalSkills: "Technical Skills to Learn",
                      dataTraining: "Data/Reporting Training",
                      roleChallenges: "Current Role Challenges",
                      efficiencyTraining: "Job Efficiency Training",
                      certifications: "Interested Certifications",
                      careerGoals: "2-Year Career Goal",
                      careerTraining: "Training for Career Goal",
                      trainingFormat: "Preferred Format",
                      trainingDuration: "Preferred Duration",
                      learningPreference: "Learning Style",
                      pastTraining: "Past Trainings",
                      pastTrainingFeedback: "Feedback on Past Trainings",
                      trainingImprovement: "Suggested Improvements",
                      areaNeed: "Urgent Training Areas",
                      trainingFrequency: "Training Frequency",
                    }

                    return Object.entries(detailLabels).map(([key, label]) => (
                      <div key={key} className="p-3 bg-gray-50 rounded-lg">
                        <div className="font-medium text-gray-700 mb-1">{label}</div>
                        <div className="text-gray-900">{selectedRequest[key] || "—"}</div>
                      </div>
                    ))
                  })()}
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 bg-gray-50">
              <div className="flex justify-end">
                <button
                  onClick={() => setSelectedRequest(null)}
                  className="bg-gray-600 hover:bg-gray-700 text-white px-6 py-2 rounded-lg transition-colors"
                >
                  Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}