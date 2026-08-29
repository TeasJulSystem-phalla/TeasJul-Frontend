import { useState, useEffect } from 'react';
import { useRoomTypes } from '../../../hooks/useRoomType.js';
import { 
  FileText, 
  Hash, 
  Users, 
  DollarSign, 
  CreditCard, 
  CheckCircle, 
  XCircle 
} from 'lucide-react';
import {
  Modal,
  Input,
  Select,
  Textarea,
  Button,
  Label,
  Spinner
} from '../index.js';

export function RoomTypeFormModal({ 
  isOpen, 
  onClose, 
  roomType = null,
  onSuccess,
  onError 
}) {
  const { createRoomType, updateRoomType } = useRoomTypes();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    capacity: 1,
    defaultRent: 0,
    defaultDeposit: 0,
    status: 'ACTIVE'
  });
  const [errors, setErrors] = useState({});
  const isEditing = !!roomType;

  useEffect(() => {
    if (roomType) {
      setFormData({
        name: roomType.name || '',
        code: roomType.code || '',
        description: roomType.description || '',
        capacity: roomType.capacity || 1,
        defaultRent: roomType.defaultRent || 0,
        defaultDeposit: roomType.defaultDeposit || 0,
        status: roomType.status || 'ACTIVE'
      });
    } else {
      setFormData({
        name: '',
        code: '',
        description: '',
        capacity: 1,
        defaultRent: 0,
        defaultDeposit: 0,
        status: 'ACTIVE'
      });
    }
    setErrors({});
  }, [roomType, isOpen]);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'number' ? parseFloat(value) || 0 : value
    }));
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.name.trim()) newErrors.name = 'តម្រូវឱ្យបញ្ចូលឈ្មោះ';
    if (!formData.code.trim()) newErrors.code = 'តម្រូវឱ្យបញ្ចូលលេខកូដ';
    if (!formData.capacity || formData.capacity < 1) {
      newErrors.capacity = 'សមត្ថភាពត្រូវតែយ៉ាងតិច ១';
    }
    if (formData.defaultRent < 0) {
      newErrors.defaultRent = 'ថ្លៃជួលមិនអាចជាលេខអវិជ្ជមានបានទេ';
    }
    if (formData.defaultDeposit < 0) {
      newErrors.defaultDeposit = 'ប្រាក់ដាក់ប្រាកដមិនអាចជាលេខអវិជ្ជមានបានទេ';
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    try {
      let response;
      if (isEditing) {
        response = await updateRoomType(roomType.id, formData);
      } else {
        response = await createRoomType(formData);
      }
      onSuccess(response);
      onClose();
    } catch (error) {
      if (error.response?.data?.message?.includes('Code must be unique')) {
        setErrors({ code: 'លេខកូដនេះមានស្រាប់ហើយ។ សូមប្រើលេខកូដផ្សេងទៀត។' });
      } else {
        onError(error);
      }
    } finally {
      setLoading(false);
    }
  };

  const statusOptions = [
    { value: 'ACTIVE', label: 'សកម្ម' },
    { value: 'INACTIVE', label: 'អសកម្ម' }
  ];

  return (
    <Modal 
      isOpen={isOpen} 
      onClose={onClose} 
      size="lg"
      className="bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 border border-white/10 shadow-2xl rounded-2xl"
    >
      <div className="relative">
        {/* Decorative gradient line */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-500 via-teal-500 to-blue-500"></div>
        
        <Modal.Header className="p-6 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400 bg-clip-text text-transparent">
                {isEditing ? 'កែប្រែប្រភេទបន្ទប់' : 'បង្កើតប្រភេទបន្ទប់'}
              </h2>
              <p className="text-gray-400 text-sm mt-1">
                {isEditing ? 'ធ្វើបច្ចុប្បន្នភាពព័ត៌មាននៃប្រភេទបន្ទប់' : 'បន្ថែមប្រភេទបន្ទប់ថ្មីទៅក្នុងបញ្ជីរបស់អ្នក'}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-200 transition-colors duration-200 p-2 rounded-lg hover:bg-white/10"
            >
              <XCircle className="w-5 h-5" />
            </button>
          </div>
        </Modal.Header>

        <form onSubmit={handleSubmit}>
          <Modal.Body className="p-6 space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Name */}
              <div>
                <Label htmlFor="name" className="text-gray-300 font-semibold flex items-center gap-2">
                  <FileText className="w-4 h-4 text-emerald-400" />
                  ឈ្មោះ <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="ឧ. Deluxe Room"
                  error={errors.name}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>

              {/* Code */}
              <div>
                <Label htmlFor="code" className="text-gray-300 font-semibold flex items-center gap-2">
                  <Hash className="w-4 h-4 text-emerald-400" />
                  លេខកូដ <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="code"
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="ឧ. DLX-001"
                  error={errors.code}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description" className="text-gray-300 font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                ការពិពណ៌នា
              </Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="ពិពណ៌នាអំពីប្រភេទបន្ទប់..."
                rows={3}
                className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Capacity */}
              <div>
                <Label htmlFor="capacity" className="text-gray-300 font-semibold flex items-center gap-2">
                  <Users className="w-4 h-4 text-emerald-400" />
                  សមត្ថភាព <span className="text-red-400">*</span>
                </Label>
                <Input
                  id="capacity"
                  name="capacity"
                  type="number"
                  min="1"
                  value={formData.capacity}
                  onChange={handleChange}
                  error={errors.capacity}
                  required
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>

              {/* Default Rent */}
              <div>
                <Label htmlFor="defaultRent" className="text-gray-300 font-semibold flex items-center gap-2">
                  <DollarSign className="w-4 h-4 text-emerald-400" />
                  តម្លៃជួលលំនាំដើម ($)
                </Label>
                <Input
                  id="defaultRent"
                  name="defaultRent"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultRent}
                  onChange={handleChange}
                  placeholder="0.00"
                  error={errors.defaultRent}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>

              {/* Default Deposit */}
              <div>
                <Label htmlFor="defaultDeposit" className="text-gray-300 font-semibold flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-emerald-400" />
                  ប្រាក់ដាក់ប្រាកដលំនាំដើម ($)
                </Label>
                <Input
                  id="defaultDeposit"
                  name="defaultDeposit"
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.defaultDeposit}
                  onChange={handleChange}
                  placeholder="0.00"
                  error={errors.defaultDeposit}
                  className="bg-gray-800/50 border-gray-700 text-white placeholder-gray-500 focus:border-emerald-500 focus:ring-emerald-500/30"
                />
              </div>
            </div>

            {/* Status */}
            <div>
              <Label htmlFor="status" className="text-gray-300 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-emerald-400" />
                ស្ថានភាព
              </Label>
              <Select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                options={statusOptions}
                className="bg-gray-800/50 border-gray-700 text-white focus:border-emerald-500 focus:ring-emerald-500/30"
              />
            </div>
          </Modal.Body>

          <Modal.Footer className="p-6 border-t border-white/10 flex justify-end gap-3 bg-gray-900/50 rounded-b-2xl">
            <Button 
              variant="outline" 
              onClick={onClose} 
              type="button"
              className="border-gray-700 text-gray-300 hover:bg-white/10 hover:border-gray-600 transition-all duration-200"
            >
              បោះបង់
            </Button>
            <Button 
              className="bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600 text-white shadow-lg shadow-emerald-500/30 hover:shadow-emerald-500/50 transition-all duration-300 transform hover:scale-105"
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Spinner size="sm" className="mr-2 text-white" />
                  {isEditing ? 'កំពុងធ្វើបច្ចុប្បន្នភាព...' : 'កំពុងបង្កើត...'}
                </>
              ) : (
                isEditing ? 'ធ្វើបច្ចុប្បន្នភាពប្រភេទបន្ទប់' : 'បង្កើតប្រភេទបន្ទប់'
              )}
            </Button>
          </Modal.Footer>
        </form>
      </div>
    </Modal>
  );
}