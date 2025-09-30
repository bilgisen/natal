'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import * as z from 'zod';
import { format } from 'date-fns';
import { enUS } from 'date-fns/locale';
import { CalendarIcon } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Calendar } from '@/components/ui/calendar';
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';

// Form validation schema
const profileFormSchema = z.object({
  birthDate: z.date({
    required_error: 'Birth date is required.',
  }),
  birthTime: z.string().regex(
    /^([01]?[0-9]|2[0-3]):[0-5][0-9](:[0-5][0-9])?$/, // Optional seconds
    'Please enter a valid time (HH:MM or HH:MM:SS)'
  ),
  timezoneOffset: z.number().int().min(-12).max(14, {
    message: 'Please select a valid timezone',
  }),
  birthPlace: z.string().min(2, {
    message: 'Birth place must be at least 2 characters.',
  }),
  gender: z.enum(['male', 'female', 'other'], {
    required_error: 'Please select a gender.',
  }),
  about: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

// Default form values
const defaultValues: Partial<ProfileFormValues> = {
  birthTime: '12:00',
  timezoneOffset: new Date().getTimezoneOffset() / -60, // Default to user's current timezone
  birthPlace: '',
  about: '',
};

// Timezone options with common GMT offsets
const timezoneOptions = [
  { value: -12, label: 'GMT-12:00' },
  { value: -11, label: 'GMT-11:00' },
  { value: -10, label: 'GMT-10:00' },
  { value: -9, label: 'GMT-09:00' },
  { value: -8, label: 'GMT-08:00' },
  { value: -7, label: 'GMT-07:00' },
  { value: -6, label: 'GMT-06:00' },
  { value: -5, label: 'GMT-05:00' },
  { value: -4, label: 'GMT-04:00' },
  { value: -3, label: 'GMT-03:00' },
  { value: -2, label: 'GMT-02:00' },
  { value: -1, label: 'GMT-01:00' },
  { value: 0, label: 'GMT±00:00' },
  { value: 1, label: 'GMT+01:00' },
  { value: 2, label: 'GMT+02:00' },
  { value: 3, label: 'GMT+03:00' },
  { value: 4, label: 'GMT+04:00' },
  { value: 5, label: 'GMT+05:00' },
  { value: 6, label: 'GMT+06:00' },
  { value: 7, label: 'GMT+07:00' },
  { value: 8, label: 'GMT+08:00' },
  { value: 9, label: 'GMT+09:00' },
  { value: 10, label: 'GMT+10:00' },
  { value: 11, label: 'GMT+11:00' },
  { value: 12, label: 'GMT+12:00' },
  { value: 13, label: 'GMT+13:00' },
  { value: 14, label: 'GMT+14:00' },
];

export function ProfileForm() {
  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues,
    mode: 'onChange',
  });

  async function onSubmit(data: ProfileFormValues) {
    try {
      // TODO: Implement API call to save profile
      console.log('Form submitted:', data);
      
      // Show success message
      // toast({
      //   title: 'Profile updated',
      //   description: 'Your profile has been updated successfully.',
      // });
    } catch (error) {
      console.error('Error saving profile:', error);
      // toast({
      //   title: 'Error',
      //   description: 'An error occurred while updating your profile. Please try again.',
      //   variant: 'destructive',
      // });
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Birth Date */}
          <FormField
            control={form.control}
            name="birthDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Date of Birth</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        className={cn(
                          'pl-3 text-left font-normal',
                          !field.value && 'text-muted-foreground'
                        )}
                      >
                        {field.value ? (
                          format(field.value, 'PPP', { locale: enUS })
                        ) : (
                          <span>Select your date of birth</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date > new Date() || date < new Date('1900-01-01')
                      }
                      initialFocus
                      locale={enUS}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Birth Time */}
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="birthTime"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Time of Birth (24-hour format)</FormLabel>
                  <FormControl>
                    <div className="flex items-center gap-2">
                      <Input 
                        type="time" 
                        step="1"
                        className="w-full"
                        {...field} 
                      />
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="timezoneOffset"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Timezone (GMT)</FormLabel>
                  <FormControl>
                    <select
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                      {...field}
                      onChange={(e) => field.onChange(Number(e.target.value))}
                    >
                      {timezoneOptions.map((tz) => (
                        <option key={tz.value} value={tz.value}>
                          {tz.label}
                        </option>
                      ))}
                    </select>
                  </FormControl>
                  <FormDescription>
                    Select your birth timezone. This is crucial for accurate astrological calculations.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Birth Place */}
          <FormField
            control={form.control}
            name="birthPlace"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Place of Birth</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your city/country of birth" {...field} />
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
                <div className="flex gap-4">
                  {[
                    { value: 'male', label: 'Male' },
                    { value: 'female', label: 'Female' },
                    { value: 'other', label: 'Other' },
                  ].map((option) => (
                    <div key={option.value} className="flex items-center space-x-2">
                      <input
                        type="radio"
                        id={option.value}
                        value={option.value}
                        checked={field.value === option.value}
                        onChange={() => field.onChange(option.value)}
                        className="h-4 w-4 text-primary focus:ring-primary"
                      />
                      <label
                        htmlFor={option.value}
                        className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                      >
                        {option.label}
                      </label>
                    </div>
                  ))}
                </div>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* About */}
          <FormField
            control={form.control}
            name="about"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>About Me</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Tell us about yourself (optional)"
                    className="min-h-[100px]"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end">
          <Button type="submit" className="w-full sm:w-auto">
            Save Changes
          </Button>
        </div>
      </form>
    </Form>
  );
}
