import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Copy, CreditCard, Smartphone, Building2 } from "lucide-react";

const Partner = () => {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    amount: "",
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: `${label} copied to clipboard`,
    });
  };

  const handleOpayUssd = async (method: string) => {
    if (!formData.name || !formData.email || !formData.phone || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("donations").insert({
        donor_name: formData.name,
        donor_email: formData.email,
        donor_phone: formData.phone,
        amount: parseFloat(formData.amount),
        payment_method: method,
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Thank you!",
        description: `Please complete your ${method} transfer to the account shown above. Your donation record has been saved.`,
      });

      setFormData({ name: "", email: "", phone: "", amount: "" });
    } catch (error) {
      console.error("Error saving donation:", error);
      toast({
        title: "Error",
        description: "Failed to save donation record",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCardPayment = async () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.amount) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    try {
      const { error } = await supabase.from("donations").insert({
        donor_name: formData.name,
        donor_email: formData.email,
        donor_phone: formData.phone,
        amount: parseFloat(formData.amount),
        payment_method: "card",
        status: "pending",
      });

      if (error) throw error;

      toast({
        title: "Processing...",
        description: "Redirecting to payment gateway...",
      });

      // TODO: Integrate with Paystack or Flutterwave for card payments
      toast({
        title: "Coming Soon",
        description: "Card payment integration will be available soon. Please use Opay or USSD for now.",
      });

      setFormData({ name: "", email: "", phone: "", amount: "" });
    } catch (error) {
      console.error("Error saving donation:", error);
      toast({
        title: "Error",
        description: "Failed to process donation",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 bg-gradient-to-b from-background to-muted/20">
        <div className="container mx-auto px-4 py-16">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12 animate-fade-in">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Partner With Us
              </h1>
              <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                Your generous contribution helps us spread the Gospel and impact lives. 
                Every seed sown is a step towards transforming communities and building God's kingdom.
              </p>
            </div>

            <Card className="shadow-elegant animate-fade-in">
              <CardHeader>
                <CardTitle className="text-2xl">Make a Donation</CardTitle>
                <CardDescription>
                  Choose your preferred payment method below
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6 mb-8">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Doe"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        placeholder="john@example.com"
                        required
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="phone">Phone Number *</Label>
                      <Input
                        id="phone"
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="09012345678"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="amount">Amount (₦) *</Label>
                      <Input
                        id="amount"
                        name="amount"
                        type="number"
                        value={formData.amount}
                        onChange={handleInputChange}
                        placeholder="5000"
                        min="100"
                        required
                      />
                    </div>
                  </div>
                </div>

                <Tabs defaultValue="opay" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="opay" className="flex items-center gap-2">
                      <Smartphone className="h-4 w-4" />
                      <span className="hidden sm:inline">Opay</span>
                    </TabsTrigger>
                    <TabsTrigger value="ussd" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      <span className="hidden sm:inline">USSD</span>
                    </TabsTrigger>
                    <TabsTrigger value="card" className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      <span className="hidden sm:inline">Card</span>
                    </TabsTrigger>
                  </TabsList>

                  <TabsContent value="opay" className="space-y-4">
                    <div className="bg-muted p-6 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="text-xl font-bold">9018281266</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard("9018281266", "Account number")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="text-lg font-semibold">Adam Justice</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard("Adam Justice", "Account name")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bank</p>
                        <p className="text-lg font-semibold">Opay</p>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleOpayUssd("opay")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "I've Made the Transfer"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="ussd" className="space-y-4">
                    <div className="bg-muted p-6 rounded-lg space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Number</p>
                          <p className="text-xl font-bold">9018281266</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard("9018281266", "Account number")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-sm text-muted-foreground">Account Name</p>
                          <p className="text-lg font-semibold">Adam Justice</p>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => copyToClipboard("Adam Justice", "Account name")}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                      <div>
                        <p className="text-sm text-muted-foreground">Bank</p>
                        <p className="text-lg font-semibold">Opay</p>
                      </div>
                      <div className="mt-4 p-4 bg-primary/10 rounded-lg">
                        <p className="text-sm font-medium mb-2">USSD Instructions:</p>
                        <ol className="text-sm space-y-1 list-decimal list-inside text-muted-foreground">
                          <li>Dial your bank's USSD code</li>
                          <li>Select Transfer option</li>
                          <li>Enter the account number above</li>
                          <li>Enter the amount</li>
                          <li>Confirm the transaction</li>
                        </ol>
                      </div>
                    </div>
                    <Button
                      className="w-full"
                      onClick={() => handleOpayUssd("ussd")}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Saving..." : "I've Made the Transfer"}
                    </Button>
                  </TabsContent>

                  <TabsContent value="card" className="space-y-4">
                    <div className="bg-muted p-6 rounded-lg text-center">
                      <CreditCard className="h-12 w-12 mx-auto mb-4 text-primary" />
                      <p className="text-lg font-semibold mb-2">Secure Card Payment</p>
                      <p className="text-sm text-muted-foreground mb-4">
                        Card payment integration coming soon. We'll redirect you to a secure payment gateway.
                      </p>
                    </div>
                    <Button
                      className="w-full"
                      onClick={handleCardPayment}
                      disabled={isSubmitting}
                    >
                      {isSubmitting ? "Processing..." : "Pay with Card (Coming Soon)"}
                    </Button>
                  </TabsContent>
                </Tabs>

                <div className="mt-6 p-4 bg-primary/5 rounded-lg">
                  <p className="text-sm text-muted-foreground text-center">
                    🙏 Thank you for your generous contribution. Your donation helps us continue our mission 
                    to spread the Gospel and impact lives worldwide.
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
};

export default Partner;
