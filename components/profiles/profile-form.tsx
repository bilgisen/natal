// components/profiles/profile-form.tsx
'use client';

import * as React from 'react';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm, type SubmitHandler } from 'react-hook-form';
import { toast } from 'sonner';
import { 
  profileFormSchemaExtended,
  profileUpdateSchema,
  type ProfileFormExtendedValues,
  type ProfileUpdateValues,
} from '@/schemas/profile.schema';
import { useCreateProfileMutation, useUpdateProfileMutation } from '@/hooks/useUpdateProfileMutation';
import { Button } from '@/components/ui/button';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { DateTimePicker } from '@/components/date-time-picker';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { CityAutocomplete } from '@/components/forms/CityAutocomplete';

export interface CityAutocompleteData {
  city: string;
  country: string;
  lat: number;
  lng: number;
  timezoneId: string;
  tz: string;
}

export interface ProfileFormProps {
  profileId?: string; // Make it optional since it's not needed for new profiles
  onSuccess?: () => void;
  variant?: 'primary' | 'secondary';
  defaultValues?: Partial<ProfileFormExtendedValues>;
}

export function ProfileForm({ 
  profileId,
  onSuccess, 
  variant: _variant = 'secondary',
  defaultValues: propDefaultValues
}: ProfileFormProps): React.JSX.Element {
  const createMutation = useCreateProfileMutation();
  const updateMutation = useUpdateProfileMutation();

  const isUpdate = !!profileId;
  const formSchema = isUpdate ? profileUpdateSchema : profileFormSchemaExtended;

  const form = useForm<ProfileFormExtendedValues | ProfileUpdateValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      birthDate: new Date(),
      birthTime: '',
      birthPlace: '',
      displayName: '',
      gender: 'prefer-not-to-say',
      profileCategory: 'self',
      ...(isUpdate ? {} : {
        birthPlaceData: {
          city: '',
          country: '',
          lat: 0,
          lng: 0,
          tz: 'UTC',
        },
      }),
      ...propDefaultValues,
    },
    mode: 'onChange', // Change from 'onSubmit' to 'onChange' for real-time validation
    reValidateMode: 'onChange',
  });

  // Helper function to calculate time value for DateTimePicker
  // Note: This variable is calculated but not currently used in the UI
  // const timeValue = React.useMemo(() => {
  //   const timeStr = form.watch('birthTime') || '12:30';
  //   const [hours, minutes] = timeStr.split(':').map(Number);
  //
  //   // Create a date in the local timezone with the specified time
  //   const date = new Date();
  //
  //   // If we have a birth date, use that as the base date
  //   const birthDate = form.watch('birthDate');
  //   if (birthDate) {
  //     date.setFullYear(
  //       birthDate.getFullYear(),
  //       birthDate.getMonth(),
  //       birthDate.getDate()
  //     );
  //   }
  //
  //   date.setHours(hours || 12, minutes || 0, 0, 0);
  //   return date;
  // }, [form.watch('birthTime'), form.watch('birthDate')]);

  const onSubmit: SubmitHandler<ProfileFormExtendedValues | ProfileUpdateValues> = async (data) => {
    try {
      const formattedData = {
        ...data,
        birthDate: data.birthDate,
        birthTime: data.birthTime || '00:00',
      };

      if (profileId) {
        // For updates, cast to ProfileUpdateValues and ensure it matches the API expectations
        const updateData = formattedData as ProfileUpdateValues;
        await updateMutation.mutateAsync({
          profileId,
          ...updateData,
        });
      } else {
        // For creation, cast to ProfileFormExtendedValues and ensure all required fields are present
        const createData = formattedData as ProfileFormExtendedValues;
        // Ensure profileCategory is present (it should be from the form)
        if (!createData.profileCategory) {
          throw new Error('Missing required fields for profile creation');
        }
        await createMutation.mutateAsync(createData);
      }
      
      toast.success('Profile saved successfully');
      form.reset(); // Reset to default values
      onSuccess?.();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  // Debug form state
  React.useEffect(() => {
    const subscription = form.watch((_value, _info) => {
      console.group('Form State');
      console.log('Form values:', JSON.parse(JSON.stringify(_value)));
      
      // Check each field's validation status
      const fields = ['displayName', 'birthDate', 'birthTime', 'birthPlace', 'birthPlaceData'];
      fields.forEach(field => {
        const fieldState = form.getFieldState(field as keyof (ProfileFormExtendedValues | ProfileUpdateValues));
        console.log(`Field '${field}':`, {
          value: form.getValues(field as keyof (ProfileFormExtendedValues | ProfileUpdateValues)),
          error: fieldState.error,
          isTouched: fieldState.isTouched,
          isDirty: fieldState.isDirty
        });
      });
      
      console.groupEnd();
    });
    
    return () => subscription.unsubscribe();
  }, [form]);

  return (
    <div className="w-full">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Display Name */}
              <FormField
                control={form.control}
                name="displayName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="Enter display name"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Profile Category - Show for both creation and update */}
              <FormField
                control={form.control}
                name="profileCategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Profile Category *</FormLabel>
                    <Select 
                      onValueChange={field.onChange} 
                      value={field.value}
                      defaultValue="self"
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select profile category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="self">Self</SelectItem>
                        <SelectItem value="family">Family</SelectItem>
                        <SelectItem value="friends">Friends</SelectItem>
                        <SelectItem value="colleagues">Colleagues</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Birth Date & Time */}
              <FormField
                control={form.control}
                name="birthDate"
                render={({ field: dateField }) => {
                  return (
                    <FormItem className="md:col-span-2">
                      <div className="flex flex-col space-y-1">
                        <FormLabel>Date & Time of Birth *</FormLabel>
                        <FormControl>
                          <DateTimePicker
                            date={dateField.value}
                            onDateChange={(date) => {
                              dateField.onChange(date);
                            }}
                            onTimeChange={(date) => {
                              // Get local time in 24-hour format (HH:MM)
                              const localHours = date.getHours();
                              const localMinutes = date.getMinutes();

                              // Format as HH:MM
                              const formattedTime = `${String(localHours).padStart(2, '0')}:${String(localMinutes).padStart(2, '0')}`;

                              // Update form value
                              form.setValue('birthTime', formattedTime, {
                                shouldValidate: true,
                                shouldDirty: true
                              });

                              // Update birthDate with the new time, preserving the selected date
                              const currentBirthDate = dateField.value || new Date();
                              const newDate = new Date(
                                currentBirthDate.getFullYear(),
                                currentBirthDate.getMonth(),
                                currentBirthDate.getDate(),
                                localHours,
                                localMinutes,
                                0,
                                0
                              );
                              form.setValue('birthDate', newDate, { shouldValidate: true });
                            }}
                          />
                        </FormControl>
                        <p className="text-xs text-muted-foreground">Use 24-hour format (e.g., 14:30)</p>
                      </div>
                      <FormMessage />
                    </FormItem>
                  );
                }}
              />

              <div className="grid grid-cols-1 gap-6 md:col-span-2">
                {/* Birth Place */}
                <FormField
                  control={form.control}
                  name="birthPlace"
                  render={({ field, fieldState }) => (
                    <FormItem>
                      <FormLabel>Place of Birth *</FormLabel>
                      <FormControl>
                        <CityAutocomplete
                          onSelect={(data: { city: string; country: string; lat: number; lng: number; timezoneId: string }) => {
                            // Update birthPlace
                            form.setValue('birthPlace', `${data.city}, ${data.country}`, { shouldValidate: true });
                            
                            // Update birthPlaceData
                            form.setValue('birthPlaceData', {
                              city: data.city,
                              country: data.country,
                              lat: data.lat,
                              lng: data.lng,
                              tz: data.timezoneId,
                            }, { shouldValidate: true });
                            
                            // Trigger validation for all related fields
                            form.trigger(['birthPlace', 'birthPlaceData']);
                          }}
                          value={field.value || ''}
                          onChange={(value: string) => form.setValue('birthPlace', value, { shouldValidate: true })}
                          placeholder="Search for a city..."
                          error={fieldState.error?.message}
                          language="en"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Gender */}
                <FormField
                  control={form.control}
                  name="gender"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gender</FormLabel>
                      <Select 
                        onValueChange={field.onChange} 
                        value={field.value}
                        defaultValue="prefer-not-to-say"
                      >
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select gender" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="male">Male</SelectItem>
                          <SelectItem value="female">Female</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                          <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

            </div>

            <div className="flex justify-end space-x-4 pt-4">
              <div className="space-y-2 w-full">
                <Button 
                  type="submit" 
                  className="w-full"
                  disabled={createMutation.isPending || updateMutation.isPending || !form.formState.isValid}
                >
                  {createMutation.isPending || updateMutation.isPending ? 'Saving...' : 'Save Profile'}
                </Button>
                {!form.formState.isValid && (
                  <div className="text-xs text-red-500 p-3 bg-red-50 rounded-md">
                    <div className="font-semibold mb-1">Form validation errors:</div>
                    {Object.entries(form.formState.errors).length > 0 ? (
                      Object.entries(form.formState.errors).map(([field, error]) => {
                        // Handle nested errors (like birthPlaceData.city)
                        if (error && typeof error === 'object' && 'message' in error) {
                          return (
                            <div key={field} className="ml-2">
                              • {field}: {error.message || 'Invalid field'}
                            </div>
                          );
                        } else if (error && typeof error === 'object') {
                          // Handle nested errors
                          return Object.entries(error).map(([nestedField, nestedError]) => {
                            if (nestedError && typeof nestedError === 'object' && 'message' in nestedError) {
                              return (
                                <div key={`${field}.${nestedField}`} className="ml-2">
                                  • {field}.{nestedField}: {nestedError.message || 'Invalid field'}
                                </div>
                              );
                            }
                            return null;
                          }).filter(Boolean);
                        }
                        return null;
                      }).filter(Boolean)
                    ) : (
                      <div>Unknown validation error. Please check the console for more details.</div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </form>
        </Form>
      </div>
  );
}