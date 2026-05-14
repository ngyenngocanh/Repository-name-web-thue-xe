<template>
  <div class="space-y-4">
    <div class="grid grid-cols-2 gap-4">
      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Tỉnh/Thành phố *</label>
        <select 
          v-model="selectedProvince" 
          @change="onProvinceChange"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
          required
        >
          <option value="">Chọn tỉnh/thành phố</option>
          <option 
            v-for="province in provinces" 
            :key="province.province_code" 
            :value="province.province_code"
          >
            {{ province.name }}
          </option>
        </select>
      </div>

      <div>
        <label class="block text-sm font-medium text-gray-700 mb-1">Phường/Xã</label>
        <select 
          v-model="selectedWard" 
          @change="onWardChange"
          :disabled="!selectedProvince"
          class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent disabled:bg-gray-100 disabled:cursor-not-allowed"
        >
          <option value="">Chọn phường/xã</option>
          <option 
            v-for="ward in wards" 
            :key="ward.ward_code" 
            :value="ward.ward_code"
          >
            {{ ward.name }}
          </option>
        </select>
      </div>
    </div>

    <div>
      <label class="block text-sm font-medium text-gray-700 mb-1">Địa chỉ cụ thể</label>
      <input 
        v-model="streetAddress" 
        type="text" 
        placeholder="Số nhà, tên đường..."
        class="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-green-500 focus:border-transparent"
      >
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, watch, nextTick } from 'vue'
import api from '@/services/api'

const props = defineProps({
  modelValue: {
    type: [String, Object], // Can be string (full address) or object (address ID)
    default: ''
  }
})

const emit = defineEmits(['update:modelValue'])

// Data
const provinces = ref([])
const wards = ref([])
const selectedProvince = ref('')
const selectedWard = ref('')
const streetAddress = ref('')

// Load provinces data
const loadProvinces = async () => {
  try {
    const response = await fetch('/data.json')
    const data = await response.json()
    provinces.value = data
  } catch (error) {
    console.error('Error loading provinces:', error)
  }
}

// Event handlers
const onProvinceChange = () => {
  // Don't clear selectedWard if we're in the middle of parsing an address
  if (selectedWard.value && wards.value.length === 0) {
    // We're likely loading wards for the first time, don't clear yet
  } else {
    selectedWard.value = ''
  }
  
  wards.value = []
  
  if (selectedProvince.value) {
    const province = provinces.value.find(p => p.province_code === selectedProvince.value)
    if (province && province.wards) {
      wards.value = province.wards.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
  
  updateFullAddress()
}

// Watch for any part of the address change to emit fullAddress string
watch([selectedProvince, selectedWard, streetAddress], () => {
  updateFullAddress()
})

// Watch for province changes and retry loading wards
watch(selectedProvince, (newValue) => {
  if (newValue && (wards.value.length === 0 || wards.value[0]?.province_code !== newValue)) {
    const province = provinces.value.find(p => p.province_code === newValue)
    if (province && province.wards) {
      wards.value = province.wards.sort((a, b) => a.name.localeCompare(b.name))
    }
  }
})

const onWardChange = () => {
  updateFullAddress()
}

const updateFullAddress = () => {
  const province = provinces.value.find(p => p.province_code === selectedProvince.value)
  const ward = wards.value.find(w => w.ward_code === selectedWard.value)
  
  let fullAddress = ''
  
  if (streetAddress.value) fullAddress += streetAddress.value + ', '
  if (ward) fullAddress += ward.name + ', '
  if (province) fullAddress += province.name
  
  emit('update:modelValue', fullAddress)
}

// Clear form
const clearForm = () => {
  streetAddress.value = ''
  selectedProvince.value = ''
  selectedWard.value = ''
  wards.value = []
  emit('update:modelValue', '')
}

// Get current address data for saving
const getAddressData = () => {
  if (!streetAddress.value || !selectedProvince.value || !selectedWard.value) {
    return null
  }
  
  const province = provinces.value.find(p => p.province_code === selectedProvince.value)
  const ward = wards.value.find(w => w.ward_code === selectedWard.value)
  
  // Critical: must have names to satisfy DB validation
  if (!province?.name || !ward?.name) {
    console.error('Missing names for saving:', { province, ward, selectedProvince: selectedProvince.value, selectedWard: selectedWard.value })
    return null
  }
  
  return {
    street: streetAddress.value,
    ward: {
      ward_code: selectedWard.value,
      name: ward.name
    },
    province: {
      province_code: selectedProvince.value,
      name: province.name
    },
    fullAddress: `${streetAddress.value}, ${ward.name}, ${province.name}`,
    isDefault: false,
    addressType: 'other'
  }
}

// Save address to database (call from parent)
const saveAddressToDB = async (referenceType, referenceId, ownerId = null) => {
  const addressData = getAddressData()
  if (!addressData) {
    return null
  }
  
  try {
    // Set reference information
    addressData.referenceType = referenceType
    addressData.referenceId = referenceId
    
    // Set owner
    if (ownerId) {
      addressData.owner = ownerId
    }
    
    const response = await api.post('/addresses', addressData)
    const newAddress = response.data.address
    return newAddress._id
  } catch (error) {
    console.error('Error saving address to DB:', error)
    return null
  }
}

// Update existing address
const updateAddressInDB = async (addressId, referenceType = null, referenceId = null) => {
  const addressData = getAddressData()
  if (!addressData || !addressId) {
    return null
  }
  
  // Add reference info if provided (useful for healing legacy records)
  if (referenceType) addressData.referenceType = referenceType
  if (referenceId) addressData.referenceId = referenceId
  
  // Handle case where addressId might be an object
  const actualAddressId = typeof addressId === 'object' ? addressId._id : addressId
  
  try {
    const response = await api.put(`/addresses/${actualAddressId}`, addressData)
    const updatedAddress = response.data.address
    return updatedAddress._id
  } catch (error) {
    console.error('Error updating address in DB:', error)
    const errorMsg = error.response?.data?.message || error.message
    if (typeof window !== 'undefined') {
      // Just log it or use a toast if available
      console.error('Address Update Failed:', errorMsg)
    }
    return null
  }
}

// Check if address is complete
const isAddressComplete = () => {
  return !!(streetAddress.value && selectedProvince.value && selectedWard.value)
}

// Watch for wards changes to set ward after loading
watch(wards, (newWards, oldWards) => {
  console.log('Wards changed:', {
    newLength: newWards.length,
    oldLength: oldWards?.length || 0,
    selectedProvince: selectedProvince.value,
    selectedWard: selectedWard.value
  })
  
  // Only try to set ward if we have new wards and a province is selected
  if (newWards.length > 0 && selectedProvince.value && !selectedWard.value) {
    // Try to get the current address data to find the ward
    const currentAddress = props.modelValue
    if (currentAddress && typeof currentAddress === 'object') {
      const wardCode = currentAddress.ward?.ward_code || currentAddress.ward_code
      if (wardCode) {
        const ward = newWards.find(w => w.ward_code === wardCode)
        if (ward) {
          console.log('Setting ward from wards watcher:', ward.name)
          selectedWard.value = wardCode
        }
      }
    }
  }
})

// Watch for external changes
watch(() => props.modelValue, (newValue) => {
  if (newValue && newValue !== streetAddress.value) {
    // Parse existing address and set form values
    if (typeof newValue === 'string') {
      parseAddress(newValue)
    } else if (typeof newValue === 'object' && newValue._id) {
      loadAddressFromObject(newValue)
    } else if (typeof newValue === 'object') {
      loadAddressById(newValue)
    } else if (typeof newValue === 'object' && newValue.street && newValue.province) {
      // Handle populated address object from backend
      loadAddressFromObject(newValue)
    }
  }
})

// Load address from object (when populated from backend)
const loadAddressFromObject = async (addressObj) => {
  console.log('Loading address from object:', addressObj)
  
  if (!addressObj) {
    console.log('No address object provided')
    return
  }
  
  // Set street address immediately
  if (addressObj.street) {
    streetAddress.value = addressObj.street
  }
  
  // Wait for provinces to load
  if (provinces.value.length === 0) {
    console.log('Waiting for provinces to load...')
    await new Promise((resolve) => {
      const unwatch = watch(() => provinces.value.length, (newLength) => {
        if (newLength > 0) {
          unwatch()
          resolve()
        }
      })
      // Timeout to avoid infinite wait
      setTimeout(() => { unwatch(); resolve(); }, 3000)
    })
  }
  
  if (provinces.value.length === 0) {
    console.log('Provinces failed to load')
    return
  }
  
  // Find and set province
  const provinceCode = addressObj.province?.province_code || addressObj.province_code
  const provinceName = addressObj.province?.name || addressObj.province
  
  let province = provinces.value.find(p => p.province_code === provinceCode)
  if (!province && provinceName) {
    province = provinces.value.find(p => p.name === provinceName)
  }
  
  if (!province) {
    console.log('Province not found:', provinceCode || provinceName)
    return
  }
  
  console.log('Found province:', province.name)
  
  // Set province and load wards
  selectedProvince.value = province.province_code
  wards.value = province.wards ? [...province.wards].sort((a, b) => a.name.localeCompare(b.name)) : []
  
  console.log('Loaded wards:', wards.value.length)
  
  // Set ward after wards are loaded
  const wardCode = addressObj.ward?.ward_code || addressObj.ward_code
  const wardName = addressObj.ward?.name || addressObj.ward

  if (wardCode || wardName) {
    // Use setTimeout to ensure Vue has time to update the wards array
    setTimeout(() => {
      let ward = wards.value.find(w => w.ward_code === wardCode)
      if (!ward && wardName) {
        ward = wards.value.find(w => w.name === wardName)
      }
      
      if (ward) {
        selectedWard.value = ward.ward_code
        console.log('Successfully set ward:', ward.name, 'code:', ward.ward_code)
      } else {
        console.log('Ward not found:', wardCode || wardName)
      }
    }, 100)
  } else {
    console.log('No ward data in address object')
  }
}

// Load address by ID
const loadAddressById = async (addressId) => {
  try {
    const response = await api.get(`/addresses/${addressId}`)
    const address = response.data
    
    console.log('Loaded address by ID:', address)
    
    // Wait for provinces to load
    if (provinces.value.length === 0) {
      await new Promise((resolve) => {
        const unwatch = watch(() => provinces.value.length, (newLength) => {
          if (newLength > 0) {
            unwatch()
            resolve()
          }
        })
        setTimeout(() => { unwatch(); resolve(); }, 3000)
      })
    }
    
    // Set form values from loaded address
    streetAddress.value = address.street || ''
    selectedProvince.value = address.province?.province_code || ''
    selectedWard.value = address.ward?.ward_code || ''
    
    // Load wards for the province
    if (address.province?.province_code) {
      const province = provinces.value.find(p => p.province_code === address.province.province_code)
      if (province && province.wards) {
        wards.value = province.wards.sort((a, b) => a.name.localeCompare(b.name))
      }
    }
  } catch (error) {
    console.error('Error loading address by ID:', error)
  }
}

// Parse existing address to form fields
const parseAddress = (address) => {
  if (!address) return
  
  console.log('Parsing address:', address)
  
  // Try different parsing patterns
  let streetPart = ''
  let wardPart = ''
  let provincePart = ''
  
  // Pattern 1: "Địa chỉ, Phường/Xã, Tỉnh/Thành phố"
  if (address.includes(',')) {
    const parts = address.split(',').map(part => part.trim())
    
    if (parts.length >= 3) {
      streetPart = parts[0]
      wardPart = parts[1]
      provincePart = parts[2]
    } else if (parts.length >= 2) {
      streetPart = parts[0]
      provincePart = parts[1]
      // Try to extract ward from street part if it contains "Xã" or "Phường"
      if (streetPart.includes('Xã') || streetPart.includes('Phường')) {
        wardPart = streetPart
        streetPart = ''
      }
    }
  } else {
    // Pattern 2: "Phường/Xã, Tỉnh/Thành phố" (no street)
    const parts = address.split(',').map(part => part.trim())
    if (parts.length >= 2) {
      wardPart = parts[0]
      provincePart = parts[1]
    }
  }
  
  // Set form values
  if (streetPart) streetAddress.value = streetPart
  
  // Find province
  if (provincePart) {
    console.log('Looking for province:', provincePart)
    const province = provinces.value.find(p => p.name === provincePart)
    
    if (province) {
      selectedProvince.value = province.province_code
      
      // Load wards first, then set ward selection
      const loadWardsAndSetWard = () => {
        console.log('Loading wards for province:', province.name)
        wards.value = province.wards ? province.wards.sort((a, b) => a.name.localeCompare(b.name)) : []
        console.log('Wards loaded:', wards.value.length)
        
        // Find and set ward after wards are loaded
        if (wardPart) {
          console.log('Looking for ward:', wardPart)
          const ward = wards.value.find(w => w.name === wardPart)
          console.log('Ward found:', ward)
          if (ward) {
            // Use nextTick to ensure DOM is updated
            nextTick(() => {
              selectedWard.value = ward.ward_code
              console.log('Set selectedWard to:', ward.ward_code, ward.name)
            })
          } else {
            console.log('Ward not found in list')
          }
        }
      }
      
      // If province has wards, load them immediately
      if (province.wards) {
        loadWardsAndSetWard()
      } else {
        // Fallback: wait for province change event
        onProvinceChange()
        // Wait a bit and try again
        setTimeout(() => {
          loadWardsAndSetWard()
        }, 100)
      }
    }
  }
  
  console.log('Parsed form values:', {
    streetAddress: streetAddress.value,
    selectedProvince: selectedProvince.value,
    selectedWard: selectedWard.value
  })
}

// Expose methods to parent
defineExpose({
  saveAddressToDB,
  updateAddressInDB,
  getAddressData,
  isAddressComplete,
  clearForm,
  loadAddressFromObject,
  parseAddress
})

onMounted(() => {
  loadProvinces()
})
</script>
