"use client";

import type React from "react";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Star, MessageSquare, Heart, Send } from "lucide-react";
import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";

export default function FeedbackPage() {
  const [formData, setFormData] = useState({
    subject: "",
    message: "",
    rating: 0,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.subject.trim()) newErrors.subject = "Subject is required";
    if (!formData.message.trim()) newErrors.message = "Message is required";
    else if (formData.message.length < 10)
      newErrors.message = "Message must be at least 10 characters";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: string, value: string | number) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: "" }));
    }
  };

  const handleRatingClick = (rating: number) => {
    setFormData((prev) => ({ ...prev, rating }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setFormData({ subject: "", message: "", rating: 0 });
      }, 3000);
    }, 1000);
  };

  if (showSuccess) {
    return (
      <>
        <Navbar />
        <div className="flex items-center justify-center min-h-[80vh] px-4">
          <Card className="w-full max-w-md text-center relative overflow-hidden bauhaus-bg-pattern">
            <CardContent className="relative pt-8 pb-8 z-10">
              <div className="w-20 h-20 mx-auto mb-6 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)]">
                <Heart className="h-10 w-10 text-bauhaus-red animate-pulse" />
              </div>
              <div className="w-12 h-1 mx-auto mb-4 flex">
                <div className="flex-1 bg-bauhaus-red"></div>
                <div className="flex-1 bg-bauhaus-yellow"></div>
                <div className="flex-1 bg-bauhaus-blue"></div>
              </div>
              <h2 className="text-2xl font-bold text-foreground mb-2">
                Thank You!
              </h2>
              <p className="text-muted-foreground mb-6">
                Your feedback has been received. We appreciate your input and
                will review it shortly.
              </p>
              <Button
                onClick={() => setShowSuccess(false)}
                variant="primary"
              >
                Submit Another Feedback
              </Button>
            </CardContent>
          </Card>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-background py-8 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          {/* Header Card */}
          <Card className="relative overflow-hidden bauhaus-bg-pattern">
            <div className="relative px-6 py-8 z-10">
              <div className="flex items-center">
                <div className="w-14 h-14 rounded-2xl bg-background flex items-center justify-center shadow-[inset_4px_4px_8px_var(--neu-shadow-dark),inset_-4px_-4px_8px_var(--neu-shadow-light)] mr-4">
                  <MessageSquare className="h-7 w-7 text-bauhaus-blue" />
                </div>
                <div>
                  <div className="w-10 h-1 mb-2 flex">
                    <div className="flex-1 bg-bauhaus-red"></div>
                    <div className="flex-1 bg-bauhaus-yellow"></div>
                    <div className="flex-1 bg-bauhaus-blue"></div>
                  </div>
                  <h1 className="text-2xl font-bold text-foreground">
                    Share Your Feedback
                  </h1>
                  <p className="text-muted-foreground text-sm">
                    Help us improve with your valuable insights
                  </p>
                </div>
              </div>
            </div>
          </Card>

          {/* Feedback Form */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <div className="w-8 h-8 rounded-lg bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] mr-3">
                  <Heart className="h-4 w-4 text-bauhaus-red" />
                </div>
                We Value Your Opinion
              </CardTitle>
              <CardDescription>
                Tell us about your experience or suggest improvements
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="subject">Subject *</Label>
                  <Input
                    id="subject"
                    placeholder="Brief description of your feedback"
                    value={formData.subject}
                    onChange={(e) =>
                      handleInputChange("subject", e.target.value)
                    }
                    className={errors.subject ? "ring-2 ring-destructive" : ""}
                  />
                  {errors.subject && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>{errors.subject}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="message">Message *</Label>
                  <Textarea
                    id="message"
                    placeholder="Please provide detailed feedback about your experience..."
                    rows={6}
                    value={formData.message}
                    onChange={(e) =>
                      handleInputChange("message", e.target.value)
                    }
                    className={`shadow-[inset_3px_3px_6px_var(--neu-shadow-dark),inset_-3px_-3px_6px_var(--neu-shadow-light)] bg-background rounded-xl ${errors.message ? "ring-2 ring-destructive" : ""}`}
                  />
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>
                      {formData.message.length}/10 characters minimum
                    </span>
                    <span>{formData.message.length}/500 characters</span>
                  </div>
                  {errors.message && (
                    <Alert variant="destructive" className="py-2">
                      <AlertDescription>{errors.message}</AlertDescription>
                    </Alert>
                  )}
                </div>

                <div className="space-y-3">
                  <Label>Rating (Optional)</Label>
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleRatingClick(star)}
                        className="w-10 h-10 rounded-xl bg-background flex items-center justify-center shadow-[3px_3px_6px_var(--neu-shadow-dark),-3px_-3px_6px_var(--neu-shadow-light)] hover:shadow-[4px_4px_8px_var(--neu-shadow-dark),-4px_-4px_8px_var(--neu-shadow-light)] active:shadow-[inset_2px_2px_4px_var(--neu-shadow-dark),inset_-2px_-2px_4px_var(--neu-shadow-light)] transition-all"
                      >
                        <Star
                          className={`h-5 w-5 transition-colors ${star <= formData.rating
                              ? "text-bauhaus-yellow fill-bauhaus-yellow"
                              : "text-muted-foreground"
                            }`}
                        />
                      </button>
                    ))}
                    {formData.rating > 0 && (
                      <span className="ml-3 text-sm text-muted-foreground">
                        {formData.rating} out of 5 stars
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex justify-end space-x-4 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => {
                      setFormData({ subject: "", message: "", rating: 0 });
                      setErrors({});
                    }}
                  >
                    Clear Form
                  </Button>
                  <Button
                    type="submit"
                    disabled={isLoading}
                    variant="primary"
                  >
                    {isLoading ? (
                      "Submitting..."
                    ) : (
                      <>
                        <Send className="mr-2 h-4 w-4" />
                        Submit Feedback
                      </>
                    )}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
      <Footer />
    </>
  );
}
