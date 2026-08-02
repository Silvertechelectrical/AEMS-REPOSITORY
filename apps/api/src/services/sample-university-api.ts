export const sampleUniversityApi = {
  async verifyStudent(registrationNumber: string) {
    return {
      registrationNumber,
      fullName: 'John Otieno',
      dateOfBirth: '2004-02-14',
      gender: 'Male',
      course: 'Computer Science',
      faculty: 'Engineering',
      academicStatus: 'ACTIVE',
      enrollmentStatus: 'ENROLLED',
      graduationDate: null,
      yearOfStudy: 3,
      studentPhoto: 'https://example.com/photo.png',
      nationalId: '12345678',
      passportNumber: 'A123456',
    };
  },
};
