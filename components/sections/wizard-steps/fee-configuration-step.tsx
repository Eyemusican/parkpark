"use client"

import { useState } from "react"
import { Card } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, ArrowRight, DollarSign, Clock, Info } from "lucide-react"

interface FeeConfigurationStepProps {
  onComplete: (data: {
    hourlyRate: number
    currency: string
    gracePeriodMinutes: number
  }) => void
  onBack: () => void
}

export function FeeConfigurationStep({ onComplete, onBack }: FeeConfigurationStepProps) {
  const [hourlyRate, setHourlyRate] = useState(20)
  const [currency, setCurrency] = useState("Nu.")
  const [gracePeriod, setGracePeriod] = useState(15)

  const handleSubmit = () => {
    onComplete({
      hourlyRate,
      currency,
      gracePeriodMinutes: gracePeriod
    })
  }

  const isValid = hourlyRate > 0 && currency.trim() && gracePeriod >= 0

  return (
    <Card className="p-6">
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-xl font-bold flex items-center gap-2">
            <DollarSign className="w-5 h-5" />
            Fee Configuration
          </h2>
          <p className="text-sm text-muted-foreground">
            Set the parking fee structure for this area
          </p>
        </div>

        {/* Fee Inputs */}
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="hourlyRate">Hourly Rate *</Label>
            <Input
              id="hourlyRate"
              type="number"
              value={hourlyRate}
              onChange={(e) => setHourlyRate(Number(e.target.value))}
              min={0}
              step={5}
              placeholder="20"
            />
            <p className="text-xs text-muted-foreground">
              Amount charged per hour of parking
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="currency">Currency *</Label>
            <Input
              id="currency"
              value={currency}
              onChange={(e) => setCurrency(e.target.value)}
              placeholder="Nu."
            />
            <p className="text-xs text-muted-foreground">
              Currency symbol (e.g., Nu., $, Rs.)
            </p>
          </div>
        </div>

        {/* Grace Period */}
        <div className="space-y-2">
          <Label htmlFor="gracePeriod" className="flex items-center gap-2">
            <Clock className="w-4 h-4" />
            Grace Period (minutes)
          </Label>
          <Input
            id="gracePeriod"
            type="number"
            value={gracePeriod}
            onChange={(e) => setGracePeriod(Number(e.target.value))}
            min={0}
            max={120}
            placeholder="15"
          />
          <p className="text-xs text-muted-foreground">
            Free parking duration before fees start applying (0 for no grace period)
          </p>
        </div>

        {/* Fee Preview */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h3 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
            <Info className="w-4 h-4" />
            Fee Preview
          </h3>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex justify-between text-blue-700">
                <span>First {gracePeriod} minutes:</span>
                <span className="font-medium text-green-600">Free</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>1 hour:</span>
                <span className="font-medium">{currency} {hourlyRate}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>2 hours:</span>
                <span className="font-medium">{currency} {hourlyRate * 2}</span>
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between text-blue-700">
                <span>3 hours:</span>
                <span className="font-medium">{currency} {hourlyRate * 3}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>4 hours:</span>
                <span className="font-medium">{currency} {hourlyRate * 4}</span>
              </div>
              <div className="flex justify-between text-blue-700">
                <span>Full day (8h):</span>
                <span className="font-medium">{currency} {hourlyRate * 8}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Example calculation */}
        <div className="bg-gray-50 border rounded-lg p-4 text-sm">
          <p className="text-gray-600">
            <strong>Example:</strong> A vehicle parked for 2 hours and 45 minutes would be charged{" "}
            <strong>{currency} {hourlyRate * 3}</strong> (3 hours, rounded up from 2h 45m).
            {gracePeriod > 0 && (
              <> The first {gracePeriod} minutes are free.</>
            )}
          </p>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <Button variant="outline" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-1" /> Back
          </Button>
          <Button onClick={handleSubmit} disabled={!isValid}>
            Next <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>
    </Card>
  )
}
