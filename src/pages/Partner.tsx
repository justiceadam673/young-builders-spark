import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { Loader2, Copy, CheckCircle2 } from "lucide-react";

const donationSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(10, "Phone number must be at least 10 digits"),
  amount: z.string().min(1, "Amount is required").refine((val) => !isNaN(Number(val)) && Number(val) > 0, "Amount must be a positive number"),
});

type DonationForm = z.infer<typeof donationSchema>;

const Partner = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();
  const { register, handleSubmit, formState: { errors }, reset } = useForm<DonationForm>({
    resolver: zodResolver(donationSchema),
  });

  const accountNumber = "9018281266";
  const accountName = "Adam Justice";

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    toast({
      title: "Copied!",
      description: "Account number copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  const saveDonation = async (data: DonationForm, paymentMethod: string, transactionRef?: string) => {
    const { error } = await supabase.from("donations").insert({
      donor_name: data.name,
      donor_email: data.email,
      donor_phone: data.phone,
      amount: Number(data.amount),
      payment_method: paymentMethod,
      transaction_reference: transactionRef || null,
      status: paymentMethod === "card" ? "pending" : "completed",
    });

    if (error) {
      console.error("Error saving donation:", error);
      throw error;
    }
  };

  const onSubmitOpay = async (data: DonationForm) => {
    setIsLoading(true);
    try {
      await saveDonation(data, "opay");
      toast({
        title: "Thank you for your support!",
        description: "Please complete the payment using the Opay account details provided.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitUSSD = async (data: DonationForm) => {
    setIsLoading(true);
    try {
      await saveDonation(data, "ussd");
      toast({
        title: "Thank you for your support!",
        description: "Please complete the payment using the USSD code provided.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to record donation. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onSubmitCard = async (data: DonationForm) => {
    setIsLoading(true);
    try {
      await saveDonation(data, "card", `REF-${Date.now()}`);
      
      toast({
        title: "Payment Gateway Coming Soon",
        description: "Card payment integration will be available soon. Please use Opay or USSD for now.",
      });
      reset();
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to process payment. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      
      <main className="flex-1 py-12 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12 animate-fade-in">
            <h1 className="text-4xl font-bold mb-4 text-gradient">Partner With Us</h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Support the growth of YBF International Ministry. Your generous contributions help us reach more young believers worldwide.
            </p>
          </div>

          <Card className="shadow-elegant">
            <CardHeader>
              <CardTitle>Choose Your Payment Method</CardTitle>
              <CardDescription>All contributions are secure and go directly to ministry activities</CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="opay" className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="opay">Opay</TabsTrigger>
                  <TabsTrigger value="ussd">USSD</TabsTrigger>
                  <TabsTrigger value="card">Card</TabsTrigger>
                </TabsList>

                <TabsContent value="opay" className="space-y-6">
                  <div className="bg-muted p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="text-2xl font-bold">{accountNumber}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(accountNumber)}
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="text-lg font-semibold">{accountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bank</p>
                      <p className="text-lg font-semibold">Opay</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmitOpay)} className="space-y-4">
                    <div>
                      <Label htmlFor="opay-name">Full Name</Label>
                      <Input id="opay-name" {...register("name")} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="opay-email">Email</Label>
                      <Input id="opay-email" type="email" {...register("email")} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="opay-phone">Phone Number</Label>
                      <Input id="opay-phone" {...register("phone")} />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="opay-amount">Amount (₦)</Label>
                      <Input id="opay-amount" type="number" {...register("amount")} />
                      {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirm Donation
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="ussd" className="space-y-6">
                  <div className="bg-muted p-6 rounded-lg space-y-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">Account Number</p>
                        <p className="text-2xl font-bold">{accountNumber}</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => copyToClipboard(accountNumber)}
                      >
                        {copied ? <CheckCircle2 className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      </Button>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Account Name</p>
                      <p className="text-lg font-semibold">{accountName}</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">Bank</p>
                      <p className="text-lg font-semibold">Opay</p>
                    </div>
                    <div className="border-t pt-4">
                      <p className="text-sm text-muted-foreground mb-2">USSD Code</p>
                      <p className="text-lg">Dial <span className="font-bold">*955*{accountNumber}#</span> on your phone</p>
                    </div>
                  </div>

                  <form onSubmit={handleSubmit(onSubmitUSSD)} className="space-y-4">
                    <div>
                      <Label htmlFor="ussd-name">Full Name</Label>
                      <Input id="ussd-name" {...register("name")} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="ussd-email">Email</Label>
                      <Input id="ussd-email" type="email" {...register("email")} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="ussd-phone">Phone Number</Label>
                      <Input id="ussd-phone" {...register("phone")} />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="ussd-amount">Amount (₦)</Label>
                      <Input id="ussd-amount" type="number" {...register("amount")} />
                      {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Confirm Donation
                    </Button>
                  </form>
                </TabsContent>

                <TabsContent value="card" className="space-y-6">
                  <div className="bg-muted p-6 rounded-lg">
                    <p className="text-sm text-muted-foreground mb-4">
                      Card payment integration is coming soon. For now, please use Opay or USSD options.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit(onSubmitCard)} className="space-y-4">
                    <div>
                      <Label htmlFor="card-name">Full Name</Label>
                      <Input id="card-name" {...register("name")} />
                      {errors.name && <p className="text-sm text-destructive mt-1">{errors.name.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="card-email">Email</Label>
                      <Input id="card-email" type="email" {...register("email")} />
                      {errors.email && <p className="text-sm text-destructive mt-1">{errors.email.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="card-phone">Phone Number</Label>
                      <Input id="card-phone" {...register("phone")} />
                      {errors.phone && <p className="text-sm text-destructive mt-1">{errors.phone.message}</p>}
                    </div>
                    <div>
                      <Label htmlFor="card-amount">Amount (₦)</Label>
                      <Input id="card-amount" type="number" {...register("amount")} />
                      {errors.amount && <p className="text-sm text-destructive mt-1">{errors.amount.message}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : null}
                      Proceed to Payment
                    </Button>
                  </form>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Partner;
