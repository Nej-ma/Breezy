"use client";

// ui components
import Image from 'next/image';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';

// hooks
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useTranslation } from 'react-i18next';

// validation schema
const signUpSchema = yup.object().shape({
    displayName: yup.string().required('Display name is required'),

    username: yup.string().required('Username is required'),

    email: yup.string().email('Invalid email').required('Email is required'),

    password: yup.string().required('Password is required')
    .min(8, 'Must be at least 8 characters')
    .matches(/[a-z]/, 'Must include a lowercase letter')
    .matches(/[A-Z]/, 'Must include an uppercase letter')
    .matches(/[0-9]/, 'Must include a number')
    .matches(/[@$!%*?&#]/, 'Must include a special character'),

    confirmPassword: yup.string()
        .oneOf([yup.ref('password')], 'Passwords must match')
        .required('Confirm password is required'),
});

// Define form values type
type SignUpFormValues = yup.InferType<typeof signUpSchema>;

export default function SignUpPage() {
    const { t } = useTranslation();

    const form = useForm<SignUpFormValues>({
        resolver: yupResolver(signUpSchema),
        defaultValues: {
            displayName: "",
            username: "",
            email: "",
            password: "",
            confirmPassword: ""
        }
    });

    const onSubmit = (data: SignUpFormValues) => {
        // Handle sign-up logic here
        console.log('Sign Up Data:', data);
    }

    return (
        <div className="flex h-screen w-screen items-center justify-center">
            <div className="w-1/2 h-full flex flex-col items-center justify-center bg-secondary">
                <Image src={"/illu_auth_page.svg"} alt="Breezy Logo" width={450} height={450} className="mb-4" />
            </div>

            <div className="w-1/2 flex flex-col items-center justify-center">
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(onSubmit)} className="flex flex-col max-w-md space-y-6">
                        <FormField
                            control={form.control}
                            name="displayName"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.displayName')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('signup.displayNamePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="username"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.username')}</FormLabel>
                                    <FormControl>
                                        <Input placeholder={t('signup.usernamePlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="email"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.email')}</FormLabel>
                                    <FormControl>
                                        <Input type="email" placeholder={t('signup.emailPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="password"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.password')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t('signup.passwordPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <FormField
                            control={form.control}
                            name="confirmPassword"
                            render={({ field }) => (
                                <FormItem>
                                    <FormLabel>{t('signup.confirmPassword')}</FormLabel>
                                    <FormControl>
                                        <Input type="password" placeholder={t('signup.confirmPasswordPlaceholder')} {...field} />
                                    </FormControl>
                                    <FormMessage />
                                </FormItem>
                            )}
                        />

                        <Button type="submit">{t('signup.submit')}</Button>
                    </form>
                </Form>
            </div>
        </div>
    );
}