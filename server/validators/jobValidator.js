export const validateJob = (data, isUpdate = false) => {
  const errors = [];
  const { title, company, description, location, skills } = data || {};

  if (!isUpdate || title !== undefined) {
    if (!title || typeof title !== 'string' || title.trim().length === 0) {
      errors.push('Job title is required');
    }
  }

  if (!isUpdate || company !== undefined) {
    if (!company || typeof company !== 'string' || company.trim().length === 0) {
      errors.push('Company name is required');
    }
  }

  if (!isUpdate || description !== undefined) {
    if (!description || typeof description !== 'string' || description.trim().length === 0) {
      errors.push('Job description is required');
    }
  }

  if (!isUpdate || location !== undefined) {
    if (!location || typeof location !== 'string' || location.trim().length === 0) {
      errors.push('Location is required');
    }
  }

  if (!isUpdate || skills !== undefined) {
    if (!skills || (Array.isArray(skills) && skills.length === 0)) {
      errors.push('At least one skill is required');
    }
  }

  return {
    isValid: errors.length === 0,
    errors
  };
};
