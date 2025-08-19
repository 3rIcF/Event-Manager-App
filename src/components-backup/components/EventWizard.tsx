import React, { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from './ui/dialog';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Calendar, MapPin, Users, ArrowRight, Check } from 'lucide-react';

interface EventWizardProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function EventWizard({ open, onOpenChange }: EventWizardProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    startDate: '',
    endDate: '',
    location: '',
    address: '',
    eventType: '',
    expectedAttendees: '',
    budget: ''
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    }
  };

  const handleBack = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleSubmit = () => {
    // Event erstellen
    // Event erstellt: ${formData.name}
    onOpenChange(false);
    setStep(1);
    setFormData({
      name: '',
      description: '',
      startDate: '',
      endDate: '',
      location: '',
      address: '',
      eventType: '',
      expectedAttendees: '',
      budget: ''
    });
  };

  const isStepValid = (stepNumber: number) => {
    switch (stepNumber) {
      case 1:
        return formData.name && formData.eventType && formData.description;
      case 2:
        return formData.startDate && formData.endDate && formData.location;
      case 3:
        return formData.expectedAttendees && formData.budget;
      default:
        return false;
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Neues Event anlegen</DialogTitle>
          <div className="flex items-center justify-between mt-4">
            {[1, 2, 3].map((stepNumber) => (
              <div key={stepNumber} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  step === stepNumber 
                    ? 'bg-primary text-primary-foreground' 
                    : step > stepNumber 
                    ? 'bg-green-500 text-white' 
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {step > stepNumber ? <Check className="w-4 h-4" /> : stepNumber}
                </div>
                {stepNumber < 3 && (
                  <div className={`w-16 h-0.5 mx-2 ${
                    step > stepNumber ? 'bg-green-500' : 'bg-muted'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="flex justify-between text-sm text-muted-foreground mt-2">
            <span>Grunddaten</span>
            <span>Zeit & Ort</span>
            <span>Details</span>
          </div>
        </DialogHeader>

        <div className="mt-6 space-y-4">
          {step === 1 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="name">Event Name *</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  placeholder="z.B. Stadtfest München 2025"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="eventType">Event Typ *</Label>
                <Select value={formData.eventType} onValueChange={(value) => handleInputChange('eventType', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Event Typ auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="festival">Festival / Open Air</SelectItem>
                    <SelectItem value="corporate">Firmen-Event</SelectItem>
                    <SelectItem value="concert">Konzert</SelectItem>
                    <SelectItem value="fair">Messe / Markt</SelectItem>
                    <SelectItem value="conference">Konferenz</SelectItem>
                    <SelectItem value="other">Sonstiges</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Beschreibung *</Label>
                <Textarea
                  id="description"
                  value={formData.description}
                  onChange={(e) => handleInputChange('description', e.target.value)}
                  placeholder="Kurze Beschreibung des Events..."
                  rows={3}
                />
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">Startdatum *</Label>
                  <Input
                    id="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={(e) => handleInputChange('startDate', e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="endDate">Enddatum *</Label>
                  <Input
                    id="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={(e) => handleInputChange('endDate', e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Veranstaltungsort *</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => handleInputChange('location', e.target.value)}
                  placeholder="z.B. Olympiapark München"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="address">Vollständige Adresse</Label>
                <Textarea
                  id="address"
                  value={formData.address}
                  onChange={(e) => handleInputChange('address', e.target.value)}
                  placeholder="Straße, PLZ Ort"
                  rows={2}
                />
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <div className="space-y-2">
                <Label htmlFor="expectedAttendees">Erwartete Teilnehmerzahl *</Label>
                <Select value={formData.expectedAttendees} onValueChange={(value) => handleInputChange('expectedAttendees', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Größenordnung auswählen" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="small">Klein (&lt; 500 Personen)</SelectItem>
                    <SelectItem value="medium">Mittel (500 - 2.000 Personen)</SelectItem>
                    <SelectItem value="large">Groß (2.000 - 10.000 Personen)</SelectItem>
                    <SelectItem value="xlarge">Sehr groß (&gt; 10.000 Personen)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="budget">Geschätztes Budget (EUR) *</Label>
                <Input
                  id="budget"
                  type="number"
                  value={formData.budget}
                  onChange={(e) => handleInputChange('budget', e.target.value)}
                  placeholder="z.B. 50000"
                />
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h4 className="font-medium mb-2">Was wird automatisch erstellt:</h4>
                <ul className="text-sm space-y-1 text-muted-foreground">
                  <li>• Standard-Checklisten basierend auf Event-Typ</li>
                  <li>• Genehmigungsverfahren und Anträge</li>
                  <li>• Initiale To-Do-Liste</li>
                  <li>• Grundlegende BOM-Struktur</li>
                </ul>
              </div>
            </>
          )}
        </div>

        <div className="flex justify-between mt-6">
          <Button 
            variant="outline" 
            onClick={handleBack}
            disabled={step === 1}
          >
            Zurück
          </Button>
          
          <div className="space-x-2">
            {step < 3 ? (
              <Button 
                onClick={handleNext}
                disabled={!isStepValid(step)}
              >
                Weiter
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            ) : (
              <Button 
                onClick={handleSubmit}
                disabled={!isStepValid(step)}
              >
                Event erstellen
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}