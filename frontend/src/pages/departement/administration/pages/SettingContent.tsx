import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/components/ui/use-toast";
import {
  Settings,
  Save,
  Building2,
  Clock,
  Mail,
  Lock,
  Database,
  Palette,
  Languages,
  Calendar,
  UserCog,
  FileText,
  Bell,
  ShieldCheck,
  Upload,
  CheckCircle2,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Sparkles,
  Zap,
  Shield,
  Globe,
  BellRing
} from "lucide-react";

const SettingContent = () => {
  // État pour les paramètres de l'entreprise
  const [companySettings, setCompanySettings] = useState({
    companyName: "NetSysteme",
    logo: "",
    address: "123 Rue de l'Exemple, 75000 Paris",
    phone: "+33 1 23 45 67 89",
    email: "contact@netsysteme.com",
    siret: "123 456 789 00012",
    tvaNumber: "FR32 123456789",
    currency: "EUR",
    fiscalYearStart: "01/01",
  });

  // État pour les paramètres d'horaires
  const [scheduleSettings, setScheduleSettings] = useState({
    timezone: "Europe/Paris",
    workDays: ["lundi", "mardi", "mercredi", "jeudi", "vendredi"],
    workHours: {
      start: "09:00",
      end: "18:00",
    },
    checkInTolerance: 15, // minutes
    autoLogout: 30, // minutes d'inactivité
  });

  // État pour les paramètres de sécurité
  const [securitySettings, setSecuritySettings] = useState({
    passwordPolicy: {
      minLength: 8,
      requireUppercase: true,
      requireNumbers: true,
      requireSpecialChars: true,
      passwordExpiry: 90, // jours
    },
    twoFactorAuth: true,
    sessionTimeout: 30, // minutes
    failedLoginAttempts: 5,
  });

  // État pour les paramètres d'email
  const [emailSettings, setEmailSettings] = useState({
    smtpHost: "smtp.example.com",
    smtpPort: 587,
    smtpUsername: "user@example.com",
    smtpPassword: "",
    fromEmail: "noreply@netsysteme.com",
    fromName: "NetSysteme",
  });

  // État pour les paramètres d'affichage
  const [displaySettings, setDisplaySettings] = useState({
    theme: "light",
    language: "fr",
    dateFormat: "DD/MM/YYYY",
    timeFormat: "24h",
    itemsPerPage: 25,
  });

  // États pour les animations et interactions
  const [activeTab, setActiveTab] = useState("company");
  const [saving, setSaving] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  // Gestion du téléchargement du logo avec animation
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setUploadingLogo(true);
      const reader = new FileReader();
      reader.onloadend = () => {
        setTimeout(() => {
          setCompanySettings(prev => ({
            ...prev,
            logo: reader.result as string
          }));
          setUploadingLogo(false);
          toast({
            title: "✅ Logo mis à jour",
            description: "Votre logo a été téléchargé avec succès.",
            action: <CheckCircle2 className="h-4 w-4 text-green-500" />,
          });
        }, 1000);
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion de la sauvegarde des paramètres avec animation
  const handleSaveSettings = async (section: string) => {
    setSaving(true);
    
    // Simulation d'un délai de sauvegarde
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    toast({
      title: "✅ Paramètres enregistrés",
      description: `Les paramètres ${section} ont été mis à jour avec succès.`,
      action: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    });
    
    setSaving(false);
  };

  // Options pour les sélecteurs
  const timezones = [
    { value: "Europe/Paris", label: "Paris (GMT+1)" },
    { value: "Europe/London", label: "Londres (GMT+0)" },
    { value: "America/New_York", label: "New York (GMT-5)" },
    { value: "Asia/Tokyo", label: "Tokyo (GMT+9)" },
  ];

  const currencies = [
    { value: "EUR", label: "Euro (€)" },
    { value: "USD", label: "Dollar US ($)" },
    { value: "XOF", label: "Franc CFA (FCFA)" },
  ];

  const daysOfWeek = [
    { value: "lundi", label: "Lundi" },
    { value: "mardi", label: "Mardi" },
    { value: "mercredi", label: "Mercredi" },
    { value: "jeudi", label: "Jeudi" },
    { value: "vendredi", label: "Vendredi" },
    { value: "samedi", label: "Samedi" },
    { value: "dimanche", label: "Dimanche" },
  ];

  // Animation pour les cartes
  const cardVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50 to-indigo-50 p-6">
      {/* Header Animé */}
      <div className="mb-8 relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-8 backdrop-blur-sm">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-pulse"></div>
        <div className="relative z-10">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-4 bg-white/20 rounded-2xl shadow-lg backdrop-blur-sm">
                  <Settings className="h-8 w-8 text-white" />
                </div>
                <Sparkles className="absolute -top-2 -right-2 h-6 w-6 text-yellow-300 animate-spin" />
              </div>
              <div>
                <h1 className="text-4xl font-black text-white mb-2">
                  Paramètres du Système
                </h1>
                <p className="text-blue-100 text-lg">Gérez la configuration complète de votre application NetSysteme</p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <Button 
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm transition-all duration-300 transform hover:scale-105"
                variant="outline"
              >
                <BellRing className="h-4 w-4 mr-2" />
                Notifications
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Cartes de Statistiques */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {[
          { label: "Paramètres Entreprise", value: "5", icon: Building2, color: "from-blue-500 to-cyan-500" },
          { label: "Règles Sécurité", value: "4", icon: ShieldCheck, color: "from-green-500 to-emerald-500" },
          { label: "Services Email", value: "6", icon: Mail, color: "from-purple-500 to-pink-500" },
          { label: "Options Affichage", value: "5", icon: Palette, color: "from-orange-500 to-red-500" }
        ].map((stat, index) => (
          <Card 
            key={stat.label}
            className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-lg transition-all duration-500 transform hover:-translate-y-2 group cursor-pointer"
            style={{ animationDelay: `${index * 200}ms` }}
          >
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-600 text-sm font-medium mb-1">{stat.label}</p>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                </div>
                <div className={`p-3 rounded-xl bg-gradient-to-r ${stat.color} shadow-md group-hover:scale-110 transition-transform duration-300`}>
                  <stat.icon className="h-6 w-6 text-white" />
                </div>
              </div>
              <div className="mt-3 w-full bg-gray-200 rounded-full h-1">
                <div 
                  className={`h-1 rounded-full bg-gradient-to-r ${stat.color} transition-all duration-1000`}
                  style={{ width: `${(parseInt(stat.value) / 6) * 100}%` }}
                ></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-5 bg-white/80 backdrop-blur-sm border border-blue-100 rounded-2xl p-1">
          {[
            { value: "company", icon: Building2, label: "Entreprise" },
            { value: "schedule", icon: Clock, label: "Horaires" },
            { value: "security", icon: ShieldCheck, label: "Sécurité" },
            { value: "email", icon: Mail, label: "Email" },
            { value: "display", icon: Palette, label: "Affichage" }
          ].map((tab) => (
            <TabsTrigger 
              key={tab.value}
              value={tab.value}
              className="flex items-center gap-2 transition-all duration-300 data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-600 data-[state=active]:to-indigo-600 data-[state=active]:text-white data-[state=active]:shadow-lg rounded-xl"
            >
              <tab.icon className="h-4 w-4" />
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        {/* Onglet Paramètres de l'Entreprise */}
        <TabsContent value="company" className="space-y-6 animate-in fade-in-0 duration-500">
          <Card className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Building2 className="h-6 w-6 text-blue-600" />
                Informations de l'Entreprise
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configurez les informations de base de votre entreprise qui seront utilisées dans les documents et l'interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="flex flex-col lg:flex-row gap-8">
                {/* Section Logo */}
                <div className="space-y-4 w-full lg:w-1/3">
                  <div className="space-y-3">
                    <Label htmlFor="companyLogo" className="text-sm font-semibold text-gray-700">
                      Logo de l'entreprise
                    </Label>
                    <div className="flex flex-col items-center gap-4 p-6 border-2 border-dashed border-blue-200 rounded-2xl bg-blue-50/50 hover:bg-blue-50 transition-all duration-300 group">
                      <div className="relative">
                        <Avatar className="h-32 w-32 border-4 border-white shadow-lg group-hover:scale-105 transition-transform duration-300">
                          {uploadingLogo ? (
                            <div className="flex items-center justify-center h-full w-full">
                              <Loader2 className="h-8 w-8 text-blue-600 animate-spin" />
                            </div>
                          ) : (
                            <>
                              <AvatarImage src={companySettings.logo} alt="Logo" />
                              <AvatarFallback className="text-2xl bg-gradient-to-r from-blue-500 to-indigo-500 text-white font-bold">
                                {companySettings.companyName.substring(0, 2).toUpperCase()}
                              </AvatarFallback>
                            </>
                          )}
                        </Avatar>
                        {companySettings.logo && !uploadingLogo && (
                          <div className="absolute -bottom-2 -right-2 bg-green-500 rounded-full p-1 shadow-lg">
                            <CheckCircle2 className="h-4 w-4 text-white" />
                          </div>
                        )}
                      </div>
                      
                      <div className="text-center space-y-2">
                        <div className="relative">
                          <Label
                            htmlFor="logo-upload" 
                            className="cursor-pointer bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white h-10 px-6 py-2 rounded-xl text-sm font-medium inline-flex items-center gap-2 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
                          >
                            {uploadingLogo ? (
                              <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                              <Upload className="h-4 w-4" />
                            )}
                            {companySettings.logo && !uploadingLogo ? "Changer le logo" : "Téléverser un logo"}
                          </Label>
                          <Input 
                            id="logo-upload" 
                            type="file" 
                            className="hidden" 
                            accept="image/*"
                            onChange={handleLogoUpload}
                            disabled={uploadingLogo}
                          />
                        </div>
                        <p className="text-xs text-gray-500">
                          PNG, JPG jusqu'à 5MB
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Section Informations */}
                <div className="space-y-6 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "companyName", label: "Nom de l'entreprise *", value: companySettings.companyName, type: "text" },
                      { id: "email", label: "Email", value: companySettings.email, type: "email" },
                      { id: "phone", label: "Téléphone", value: companySettings.phone, type: "text" },
                      { 
                        id: "currency", 
                        label: "Devise", 
                        value: companySettings.currency, 
                        type: "select",
                        options: currencies 
                      },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2 group">
                        <Label htmlFor={field.id} className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                          {field.label}
                        </Label>
                        {field.type === "select" ? (
                          <Select 
                            value={field.value}
                            onValueChange={(value) => setCompanySettings({...companySettings, currency: value})}
                          >
                            <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 group-hover:border-blue-300">
                              <SelectValue placeholder="Sélectionnez une devise" />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {field.options?.map((option) => (
                                <SelectItem key={option.value} value={option.value} className="focus:bg-blue-50">
                                  {option.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        ) : (
                          <Input 
                            id={field.id}
                            type={field.type}
                            value={field.value}
                            onChange={(e) => setCompanySettings({...companySettings, [field.id]: e.target.value})}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 group-hover:border-blue-300"
                          />
                        )}
                      </div>
                    ))}
                  </div>
                  
                  <div className="space-y-2 group">
                    <Label htmlFor="address" className="text-sm font-semibold text-gray-700">
                      Adresse
                    </Label>
                    <Textarea 
                      id="address" 
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      rows={3}
                      className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 group-hover:border-blue-300 resize-none"
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {[
                      { id: "siret", label: "SIRET", value: companySettings.siret },
                      { id: "tva", label: "N° TVA intracommunautaire", value: companySettings.tvaNumber },
                    ].map((field) => (
                      <div key={field.id} className="space-y-2 group">
                        <Label htmlFor={field.id} className="text-sm font-semibold text-gray-700">
                          {field.label}
                        </Label>
                        <Input 
                          id={field.id}
                          value={field.value}
                          onChange={(e) => setCompanySettings({...companySettings, [field.id]: e.target.value})}
                          className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 group-hover:border-blue-300"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => handleSaveSettings("de l'entreprise")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Horaires */}
        <TabsContent value="schedule" className="space-y-6 animate-in fade-in-0 duration-500">
          <Card className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Clock className="h-6 w-6 text-blue-600" />
                Paramètres des Horaires
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configurez les horaires de travail, les jours ouvrés et les paramètres de pointage.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Globe className="h-4 w-4 text-blue-600" />
                      Configuration générale
                    </h3>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Fuseau horaire</Label>
                      <Select 
                        value={scheduleSettings.timezone}
                        onValueChange={(value) => setScheduleSettings({...scheduleSettings, timezone: value})}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          {timezones.map((tz) => (
                            <SelectItem key={tz.value} value={tz.value} className="focus:bg-blue-50">
                              {tz.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Plage horaire de travail</Label>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600">Heure d'ouverture</Label>
                          <Input 
                            type="time" 
                            value={scheduleSettings.workHours.start}
                            onChange={(e) => setScheduleSettings({
                              ...scheduleSettings, 
                              workHours: {...scheduleSettings.workHours, start: e.target.value}
                            })}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label className="text-xs text-gray-600">Heure de fermeture</Label>
                          <Input 
                            type="time" 
                            value={scheduleSettings.workHours.end}
                            onChange={(e) => setScheduleSettings({
                              ...scheduleSettings, 
                              workHours: {...scheduleSettings.workHours, end: e.target.value}
                            })}
                            className="border-gray-300 focus:border-blue-500 focus:ring-blue-500"
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Jours de travail
                    </h3>
                    
                    <div className="grid grid-cols-2 gap-3">
                      {daysOfWeek.map((day) => (
                        <div 
                          key={day.value} 
                          className={`flex items-center gap-3 p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                            scheduleSettings.workDays.includes(day.value)
                              ? 'border-blue-500 bg-blue-50 shadow-sm'
                              : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                          }`}
                          onClick={() => {
                            const newWorkDays = scheduleSettings.workDays.includes(day.value)
                              ? scheduleSettings.workDays.filter(d => d !== day.value)
                              : [...scheduleSettings.workDays, day.value];
                            setScheduleSettings({...scheduleSettings, workDays: newWorkDays});
                          }}
                        >
                          <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-200 ${
                            scheduleSettings.workDays.includes(day.value)
                              ? 'bg-blue-500 border-blue-500'
                              : 'bg-white border-gray-400'
                          }`} />
                          <Label className="font-medium text-gray-900 cursor-pointer">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-blue-600" />
                      Paramètres de sécurité
                    </h3>
                    
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div>
                          <Label className="font-medium text-gray-900">Tolérance de pointage</Label>
                          <p className="text-sm text-gray-600">Délai de grâce pour les retards</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Input 
                            type="number" 
                            min="0" 
                            max="60"
                            value={scheduleSettings.checkInTolerance}
                            onChange={(e) => setScheduleSettings({
                              ...scheduleSettings, 
                              checkInTolerance: parseInt(e.target.value) || 0
                            })}
                            className="w-20 text-center border-gray-300 focus:border-blue-500"
                          />
                          <span className="text-gray-600">min</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors duration-200">
                        <div>
                          <Label className="font-medium text-gray-900">Début d'année fiscale</Label>
                          <p className="text-sm text-gray-600">Date de début de l'exercice</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Select 
                            value={companySettings.fiscalYearStart.split('/')[0]}
                            onValueChange={(value) => {
                              const day = value.padStart(2, '0');
                              const month = companySettings.fiscalYearStart.split('/')[1];
                              setCompanySettings({
                                ...companySettings, 
                                fiscalYearStart: `${day}/${month}`
                              });
                            }}
                          >
                            <SelectTrigger className="w-20 border-gray-300 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {Array.from({length: 31}, (_, i) => (i + 1).toString().padStart(2, '0')).map((day) => (
                                <SelectItem key={day} value={day}>{day}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <span>/</span>
                          <Select 
                            value={companySettings.fiscalYearStart.split('/')[1]}
                            onValueChange={(value) => {
                              const day = companySettings.fiscalYearStart.split('/')[0];
                              setCompanySettings({
                                ...companySettings, 
                                fiscalYearStart: `${day}/${value}`
                              });
                            }}
                          >
                            <SelectTrigger className="w-20 border-gray-300 focus:border-blue-500">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent className="bg-white border-gray-300">
                              {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map((month) => (
                                <SelectItem key={month} value={month}>{month}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => handleSaveSettings("d'horaires")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-6 animate-in fade-in-0 duration-500">
          <Card className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <ShieldCheck className="h-6 w-6 text-blue-600" />
                Paramètres de Sécurité
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configurez les politiques de sécurité et les accès à l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="space-y-6">
                <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-2xl border border-blue-100">
                  <h3 className="font-semibold text-gray-900 text-lg mb-4 flex items-center gap-2">
                    <Lock className="h-5 w-5 text-blue-600" />
                    Politique de mot de passe
                  </h3>
                  
                  <div className="space-y-4">
                    {[
                      {
                        label: "Longueur minimale",
                        description: "Nombre minimum de caractères requis",
                        value: securitySettings.passwordPolicy.minLength,
                        onChange: (value: number) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            minLength: value
                          }
                        }),
                        type: "number",
                        min: 6,
                        max: 32,
                        unit: "caractères"
                      },
                      {
                        label: "Expiration du mot de passe",
                        description: "Durée avant d'exiger un nouveau mot de passe",
                        value: securitySettings.passwordPolicy.passwordExpiry,
                        onChange: (value: number) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            passwordExpiry: value
                          }
                        }),
                        type: "number",
                        min: 1,
                        max: 365,
                        unit: "jours"
                      }
                    ].map((setting, index) => (
                      <div key={index} className="flex items-center justify-between p-4 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors duration-200">
                        <div className="flex-1">
                          <Label className="font-medium text-gray-900">{setting.label}</Label>
                          <p className="text-sm text-gray-600">{setting.description}</p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Input 
                            type={setting.type}
                            min={setting.min}
                            max={setting.max}
                            value={setting.value}
                            onChange={(e) => setting.onChange(parseInt(e.target.value) || setting.min!)}
                            className="w-20 text-center border-gray-300 focus:border-blue-500"
                          />
                          <span className="text-gray-600 font-medium min-w-[80px]">{setting.unit}</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <div className="mt-6 space-y-3">
                    <h4 className="font-medium text-gray-900">Exigences de complexité</h4>
                    {[
                      {
                        id: "require-uppercase",
                        label: "Majuscules (A-Z)",
                        checked: securitySettings.passwordPolicy.requireUppercase,
                        onChange: (checked: boolean) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireUppercase: checked
                          }
                        })
                      },
                      {
                        id: "require-numbers",
                        label: "Chiffres (0-9)",
                        checked: securitySettings.passwordPolicy.requireNumbers,
                        onChange: (checked: boolean) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireNumbers: checked
                          }
                        })
                      },
                      {
                        id: "require-special",
                        label: "Caractères spéciaux (!@#$%^&*)",
                        checked: securitySettings.passwordPolicy.requireSpecialChars,
                        onChange: (checked: boolean) => setSecuritySettings({
                          ...securitySettings,
                          passwordPolicy: {
                            ...securitySettings.passwordPolicy,
                            requireSpecialChars: checked
                          }
                        })
                      }
                    ].map((requirement) => (
                      <div 
                        key={requirement.id}
                        className="flex items-center justify-between p-3 bg-white rounded-lg border border-blue-100 hover:border-blue-300 transition-colors duration-200"
                      >
                        <Label htmlFor={requirement.id} className="font-medium text-gray-900 cursor-pointer flex-1">
                          {requirement.label}
                        </Label>
                        <Switch 
                          id={requirement.id}
                          checked={requirement.checked}
                          onCheckedChange={requirement.onChange}
                          className="data-[state=checked]:bg-blue-600"
                        />
                      </div>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div className="space-y-4">
                  <h3 className="font-semibold text-gray-900 text-lg">Paramètres de session</h3>
                  
                  {[
                    {
                      label: "Authentification à deux facteurs (2FA)",
                      description: "Exiger une vérification supplémentaire pour la connexion",
                      checked: securitySettings.twoFactorAuth,
                      onChange: (checked: boolean) => setSecuritySettings({
                        ...securitySettings,
                        twoFactorAuth: checked
                      })
                    },
                    {
                      label: "Déconnexion automatique",
                      description: "Durée d'inactivité avant déconnexion",
                      value: securitySettings.sessionTimeout,
                      onChange: (value: number) => setSecuritySettings({
                        ...securitySettings,
                        sessionTimeout: value
                      }),
                      type: "number",
                      min: 1,
                      max: 1440,
                      unit: "minutes"
                    },
                    {
                      label: "Nombre d'échecs de connexion",
                      description: "Tentatives avant verrouillage du compte",
                      value: securitySettings.failedLoginAttempts,
                      onChange: (value: number) => setSecuritySettings({
                        ...securitySettings,
                        failedLoginAttempts: value
                      }),
                      type: "number",
                      min: 1,
                      max: 10,
                      unit: "tentatives"
                    }
                  ].map((setting, index) => (
                    <div 
                      key={index}
                      className="flex items-center justify-between p-4 bg-gray-50 rounded-lg border border-gray-200 hover:border-blue-300 transition-colors duration-200"
                    >
                      <div className="flex-1">
                        <Label className="font-medium text-gray-900">{setting.label}</Label>
                        <p className="text-sm text-gray-600">{setting.description}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        {setting.hasOwnProperty('checked') ? (
                          <Switch 
                            checked={setting.checked}
                            onCheckedChange={setting.onChange}
                            className="data-[state=checked]:bg-blue-600"
                          />
                        ) : (
                          <>
                            <Input 
                              type={setting.type}
                              min={setting.min}
                              max={setting.max}
                              value={setting.value}
                              onChange={(e) => setting.onChange(parseInt(e.target.value) || setting.min!)}
                              className="w-20 text-center border-gray-300 focus:border-blue-500"
                            />
                            <span className="text-gray-600 font-medium min-w-[80px]">{setting.unit}</span>
                          </>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => handleSaveSettings("de sécurité")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Email */}
        <TabsContent value="email" className="space-y-6 animate-in fade-in-0 duration-500">
          <Card className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Mail className="h-6 w-6 text-blue-600" />
                Paramètres Email
              </CardTitle>
              <CardDescription className="text-gray-600">
                Configurez les paramètres SMTP pour l'envoi d'emails depuis l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {[
                  {
                    label: "Serveur SMTP",
                    value: emailSettings.smtpHost,
                    onChange: (value: string) => setEmailSettings({...emailSettings, smtpHost: value}),
                    placeholder: "smtp.example.com",
                    type: "text"
                  },
                  {
                    label: "Port SMTP",
                    value: emailSettings.smtpPort,
                    onChange: (value: number) => setEmailSettings({...emailSettings, smtpPort: value}),
                    placeholder: "587",
                    type: "number"
                  },
                  {
                    label: "Nom d'utilisateur SMTP",
                    value: emailSettings.smtpUsername,
                    onChange: (value: string) => setEmailSettings({...emailSettings, smtpUsername: value}),
                    placeholder: "user@example.com",
                    type: "text"
                  },
                  {
                    label: "Mot de passe SMTP",
                    value: emailSettings.smtpPassword,
                    onChange: (value: string) => setEmailSettings({...emailSettings, smtpPassword: value}),
                    placeholder: "••••••••",
                    type: "password",
                    showPasswordToggle: true
                  },
                  {
                    label: "Email d'expédition",
                    value: emailSettings.fromEmail,
                    onChange: (value: string) => setEmailSettings({...emailSettings, fromEmail: value}),
                    placeholder: "noreply@votredomaine.com",
                    type: "email",
                    fullWidth: true
                  },
                  {
                    label: "Nom d'expédition",
                    value: emailSettings.fromName,
                    onChange: (value: string) => setEmailSettings({...emailSettings, fromName: value}),
                    placeholder: "Votre Société",
                    type: "text",
                    fullWidth: true
                  }
                ].map((field, index) => (
                  <div 
                    key={index} 
                    className={`space-y-2 group ${field.fullWidth ? 'lg:col-span-2' : ''}`}
                  >
                    <Label className="text-sm font-semibold text-gray-700">{field.label}</Label>
                    <div className="relative">
                      <Input 
                        type={field.type === "password" && showSmtpPassword ? "text" : field.type}
                        value={field.value}
                        onChange={(e) => field.onChange(field.type === "number" ? parseInt(e.target.value) || 0 : e.target.value)}
                        placeholder={field.placeholder}
                        className="border-gray-300 focus:border-blue-500 focus:ring-blue-500 transition-colors duration-200 group-hover:border-blue-300 pr-10"
                      />
                      {field.showPasswordToggle && (
                        <button
                          type="button"
                          onClick={() => setShowSmtpPassword(!showSmtpPassword)}
                          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-600 transition-colors duration-200"
                        >
                          {showSmtpPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="bg-gradient-to-r from-yellow-50 to-orange-50 border-l-4 border-yellow-400 p-4 rounded-lg">
                <div className="flex items-start gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 mt-0.5 flex-shrink-0" />
                  <div>
                    <p className="text-sm text-yellow-800 font-medium">
                      Information de sécurité
                    </p>
                    <p className="text-sm text-yellow-700 mt-1">
                      Pour des raisons de sécurité, le mot de passe est masqué. Laissez le champ vide pour conserver le mot de passe actuel.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => handleSaveSettings("d'email")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Affichage */}
        <TabsContent value="display" className="space-y-6 animate-in fade-in-0 duration-500">
          <Card className="bg-white border-blue-100 shadow-sm rounded-2xl overflow-hidden hover:shadow-md transition-all duration-300">
            <CardHeader className="bg-gradient-to-r from-blue-50 to-indigo-50 border-b border-blue-100">
              <CardTitle className="flex items-center gap-2 text-2xl">
                <Palette className="h-6 w-6 text-blue-600" />
                Paramètres d'Affichage
              </CardTitle>
              <CardDescription className="text-gray-600">
                Personnalisez l'apparence et le comportement de l'interface utilisateur.
              </CardDescription>
            </CardHeader>
            <CardContent className="p-6 space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Palette className="h-4 w-4 text-blue-600" />
                      Apparence
                    </h3>
                    
                    {[
                      {
                        label: "Thème de l'application",
                        value: displaySettings.theme,
                        onChange: (value: string) => setDisplaySettings({...displaySettings, theme: value}),
                        options: [
                          { value: "light", label: "Clair", icon: "☀️" },
                          { value: "dark", label: "Sombre", icon: "🌙" },
                          { value: "system", label: "Système", icon: "💻" }
                        ]
                      },
                      {
                        label: "Langue",
                        value: displaySettings.language,
                        onChange: (value: string) => setDisplaySettings({...displaySettings, language: value}),
                        options: [
                          { value: "fr", label: "Français", icon: "🇫🇷" },
                          { value: "en", label: "English", icon: "🇺🇸" },
                          { value: "es", label: "Español", icon: "🇪🇸" }
                        ]
                      }
                    ].map((setting) => (
                      <div key={setting.label} className="space-y-3">
                        <Label className="text-sm font-semibold text-gray-700">{setting.label}</Label>
                        <Select 
                          value={setting.value}
                          onValueChange={setting.onChange}
                        >
                          <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                            <SelectValue placeholder={`Sélectionnez ${setting.label.toLowerCase()}`} />
                          </SelectTrigger>
                          <SelectContent className="bg-white border-gray-300">
                            {setting.options.map((option) => (
                              <SelectItem key={option.value} value={option.value} className="focus:bg-blue-50">
                                <span className="flex items-center gap-2">
                                  <span>{option.icon}</span>
                                  {option.label}
                                </span>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="space-y-4">
                    <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-blue-600" />
                      Formatage
                    </h3>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Format de date</Label>
                      <Select 
                        value={displaySettings.dateFormat}
                        onValueChange={(value) => setDisplaySettings({...displaySettings, dateFormat: value})}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue placeholder="Sélectionnez un format" />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="DD/MM/YYYY">31/12/2023</SelectItem>
                          <SelectItem value="MM/DD/YYYY">12/31/2023</SelectItem>
                          <SelectItem value="YYYY-MM-DD">2023-12-31</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Format d'heure</Label>
                      <div className="grid grid-cols-2 gap-3">
                        {[
                          { value: "24h", label: "24 heures", example: "14:30" },
                          { value: "12h", label: "12 heures", example: "2:30 PM" }
                        ].map((format) => (
                          <div 
                            key={format.value}
                            className={`p-3 rounded-lg border-2 cursor-pointer transition-all duration-200 ${
                              displaySettings.timeFormat === format.value
                                ? 'border-blue-500 bg-blue-50 shadow-sm'
                                : 'border-gray-200 bg-gray-50 hover:border-blue-300 hover:bg-blue-50/50'
                            }`}
                            onClick={() => setDisplaySettings({
                              ...displaySettings,
                              timeFormat: format.value as "24h" | "12h"
                            })}
                          >
                            <div className="flex items-center justify-between">
                              <div>
                                <div className="font-medium text-gray-900">{format.label}</div>
                                <div className="text-sm text-gray-600">{format.example}</div>
                              </div>
                              <div className={`w-3 h-3 rounded-full border-2 transition-colors duration-200 ${
                                displaySettings.timeFormat === format.value
                                  ? 'bg-blue-500 border-blue-500'
                                  : 'bg-white border-gray-400'
                              }`} />
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <Label className="text-sm font-semibold text-gray-700">Éléments par page</Label>
                      <Select 
                        value={displaySettings.itemsPerPage.toString()}
                        onValueChange={(value) => setDisplaySettings({
                          ...displaySettings,
                          itemsPerPage: parseInt(value)
                        })}
                      >
                        <SelectTrigger className="border-gray-300 focus:border-blue-500 focus:ring-blue-500">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-white border-gray-300">
                          <SelectItem value="10">10 éléments</SelectItem>
                          <SelectItem value="25">25 éléments</SelectItem>
                          <SelectItem value="50">50 éléments</SelectItem>
                          <SelectItem value="100">100 éléments</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-6 border-t border-gray-200">
                <Button 
                  onClick={() => handleSaveSettings("d'affichage")}
                  className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-8 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105"
                  disabled={saving}
                >
                  {saving ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-2" />
                  )}
                  {saving ? "Enregistrement..." : "Enregistrer les modifications"}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default SettingContent;