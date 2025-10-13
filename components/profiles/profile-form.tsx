// components/profiles/profile-form.tsx
'use client';

import * as React from 'react';
import { z } from 'zod';
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
  // Note: tz is not included here to match the CityAutocomplete component's onSelect type
}

export interface ProfileFormProps {
  profileId?: string;
  onSuccess?: () => void;
  variant?: 'primary' | 'secondary';
  defaultValues?: Partial<ProfileFormExtendedValues | ProfileUpdateValues>;
}

export function ProfileForm({ 
  profileId,
  onSuccess, 
  // variant is currently not used but kept for future use
  // variant: 'secondary',
  defaultValues: propDefaultValues
}: ProfileFormProps): React.JSX.Element {
  const createMutation = useCreateProfileMutation();
  const updateMutation = useUpdateProfileMutation();

  const isUpdate = !!profileId;

  // Select the appropriate schema based on the mode
  const formSchema = isUpdate ? profileUpdateSchema : profileFormSchemaExtended;

  // Define a more flexible type that encompasses both schemas.
  // The key is to make optional fields optional in the form type,
  // and handle defaults internally.
  type FormValues = {
    birthDate: Date;
    birthTime?: string; // Make optional in the form type
    birthPlace: string;
    displayName: string;
    profileCategory: "other" | "self" | "family" | "friends" | "colleagues";
    birthPlaceData: {
      city: string;
      country: string;
      lat: number;
      lng: number;
      tz: string;
    };
    gender?: "male" | "female" | "other" | "prefer-not-to-say";
    // Add other common fields if they differ between schemas
  };

  // Construct default values ensuring required fields are present
  // and optional fields like birthTime have a default value.
  const defaultedValues = React.useMemo(() => {
    const defaults: Partial<FormValues> = {
      birthDate: new Date(),
      birthTime: '00:00', // Default to handle the optional/required mismatch
      birthPlace: '',
      displayName: '',
      gender: 'prefer-not-to-say',
      profileCategory: 'self',
      birthPlaceData: {
        city: '',
        country: '',
        lat: 0,
        lng: 0,
        tz: 'UTC',
      },
      ...propDefaultValues,
    };

    // Ensure required fields are present and birthTime is a string
    return {
      ...defaults,
      birthTime: defaults.birthTime || '00:00', // Guarantee a string value
      displayName: defaults.displayName || '',
      birthPlace: defaults.birthPlace || '',
      profileCategory: defaults.profileCategory || 'self',
      gender: defaults.gender || 'prefer-not-to-say',
      birthPlaceData: {
        city: defaults.birthPlaceData?.city || '',
        country: defaults.birthPlaceData?.country || '',
        lat: defaults.birthPlaceData?.lat || 0,
        lng: defaults.birthPlaceData?.lng || 0,
        tz: defaults.birthPlaceData?.tz || 'UTC',
      },
    } as FormValues; // Type assertion after ensuring all required fields are filled
  }, [propDefaultValues]);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema as any), // Using any as a last resort due to complex type requirements
    defaultValues: defaultedValues,
    mode: 'onChange',
    reValidateMode: 'onChange',
  });

  const onSubmit: SubmitHandler<FormValues> = async (data) => {
    try {
      // Ensure birthTime is always a string before submission, as required by the update schema
      const processedData = {
        ...data,
        birthTime: data.birthTime || '00:00',
      };

      if (isUpdate) {
        // Cast to the specific update type for the mutation
        const updateData = processedData as ProfileUpdateValues;
        await updateMutation.mutateAsync({
          profileId: profileId!,
          ...updateData,
        });
      } else {
        // Cast to the specific create type for the mutation
        const createData = processedData as ProfileFormExtendedValues;
        await createMutation.mutateAsync(createData);
      }
      
      toast.success('Profile saved successfully');
      form.reset(defaultedValues);
      onSuccess?.();
    } catch (error) {
      console.error('Error saving profile:', error);
      toast.error('Failed to save profile');
    }
  };

  // Debug form state (optional)
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      const subscription = form.watch((value) => {
        console.group('Form State');
        console.log('Form values:', JSON.parse(JSON.stringify(value)));
        console.groupEnd();
      });
      
      return () => subscription.unsubscribe();
    }
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

            {/* Profile Category */}
            <FormField
              control={form.control}
              name="profileCategory"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Profile Category *</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    value={field.value}
                    defaultValue={field.value || "self"}
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
                          time={dateField.value} // Pass the time from the date object
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
                        onSelect={(data) => {
                          form.setValue('birthPlace', `${data.city}, ${data.country}`, { shouldValidate: true });
                          form.setValue('birthPlaceData', {
                            city: data.city,
                            country: data.country,
                            lat: data.lat,
                            lng: data.lng,
                            tz: data.timezoneId, // Use timezoneId as tz
                          }, { shouldValidate: true });
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
                      defaultValue={field.value || "prefer-not-to-say"}
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
                <div className="text-xs text-red-500 p-3 bg-red-500/10 rounded-md"> {/* Fixed conflicting classes */}
                  <div className="font-semibold mb-1">Form validation errors:</div>
                  {Object.entries(form.formState.errors).length > 0 ? (
                    Object.entries(form.formState.errors).map(([field, error]) => {
                      if (error && typeof error === 'object' && 'message' in error) {
                        return (
                          <div key={field} className="ml-2">
                            • {field}: {error.message || 'Invalid field'}
                          </div>
                        );
                      } else if (error && typeof error === 'object') {
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