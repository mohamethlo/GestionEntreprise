import React, { useState } from "react";
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
  AlertCircle
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

  // Gestion du téléchargement du logo
  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanySettings(prev => ({
          ...prev,
          logo: reader.result as string
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Gestion de la sauvegarde des paramètres
  const handleSaveSettings = (section: string) => {
    toast({
      title: "Paramètres enregistrés",
      description: `Les paramètres ${section} ont été mis à jour avec succès.`,
      action: <CheckCircle2 className="h-4 w-4 text-green-500" />,
    });
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

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-3">
            <Settings className="h-6 w-6" /> Paramètres du Système
          </h2>
          <p className="text-sm text-muted-foreground">
            Gérez la configuration complète de votre application NetSysteme
          </p>
        </div>
      </div>

      <Tabs defaultValue="company" className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="company" className="flex items-center gap-2">
            <Building2 className="h-4 w-4" /> Entreprise
          </TabsTrigger>
          <TabsTrigger value="schedule" className="flex items-center gap-2">
            <Clock className="h-4 w-4" /> Horaires
          </TabsTrigger>
          <TabsTrigger value="security" className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4" /> Sécurité
          </TabsTrigger>
          <TabsTrigger value="email" className="flex items-center gap-2">
            <Mail className="h-4 w-4" /> Email
          </TabsTrigger>
          <TabsTrigger value="display" className="flex items-center gap-2">
            <Palette className="h-4 w-4" /> Affichage
          </TabsTrigger>
        </TabsList>

        {/* Onglet Paramètres de l'Entreprise */}
        <TabsContent value="company" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Building2 className="h-5 w-5" />
                Informations de l'Entreprise
              </CardTitle>
              <CardDescription>
                Configurez les informations de base de votre entreprise qui seront utilisées dans les documents et l'interface.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-6">
                <div className="space-y-4 w-full sm:w-1/3">
                  <div className="space-y-2">
                    <Label htmlFor="companyLogo">Logo de l'entreprise</Label>
                    <div className="flex flex-col items-center gap-4">
                      <Avatar className="h-32 w-32">
                        <AvatarImage src={companySettings.logo} alt="Logo" />
                        <AvatarFallback className="text-2xl">
                          {companySettings.companyName.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div className="relative">
                        <Label
                          htmlFor="logo-upload" 
                          className="cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90 h-9 px-4 py-2 rounded-md text-sm font-medium inline-flex items-center gap-2"
                        >
                          <Upload className="h-4 w-4" />
                          {companySettings.logo ? "Changer le logo" : "Téléverser un logo"}
                        </Label>
                        <Input 
                          id="logo-upload" 
                          type="file" 
                          className="hidden" 
                          accept="image/*"
                          onChange={handleLogoUpload}
                        />
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4 flex-1">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="companyName">Nom de l'entreprise *</Label>
                      <Input 
                        id="companyName" 
                        value={companySettings.companyName}
                        onChange={(e) => setCompanySettings({...companySettings, companyName: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">Email</Label>
                      <Input 
                        id="email" 
                        type="email" 
                        value={companySettings.email}
                        onChange={(e) => setCompanySettings({...companySettings, email: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Téléphone</Label>
                      <Input 
                        id="phone" 
                        value={companySettings.phone}
                        onChange={(e) => setCompanySettings({...companySettings, phone: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="currency">Devise</Label>
                      <Select 
                        value={companySettings.currency}
                        onValueChange={(value) => setCompanySettings({...companySettings, currency: value})}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionnez une devise" />
                        </SelectTrigger>
                        <SelectContent>
                          {currencies.map((currency) => (
                            <SelectItem key={currency.value} value={currency.value}>
                              {currency.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="address">Adresse</Label>
                    <Textarea 
                      id="address" 
                      value={companySettings.address}
                      onChange={(e) => setCompanySettings({...companySettings, address: e.target.value})}
                      rows={2}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="siret">SIRET</Label>
                      <Input 
                        id="siret" 
                        value={companySettings.siret}
                        onChange={(e) => setCompanySettings({...companySettings, siret: e.target.value})}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="tva">N° TVA intracommunautaire</Label>
                      <Input 
                        id="tva" 
                        value={companySettings.tvaNumber}
                        onChange={(e) => setCompanySettings({...companySettings, tvaNumber: e.target.value})}
                      />
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t mt-6">
                <Button 
                  onClick={() => handleSaveSettings("de l'entreprise")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Horaires */}
        <TabsContent value="schedule" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Paramètres des Horaires
              </CardTitle>
              <CardDescription>
                Configurez les horaires de travail, les jours ouvrés et les paramètres de pointage.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label>Fuseau horaire</Label>
                    <Select 
                      value={scheduleSettings.timezone}
                      onValueChange={(value) => setScheduleSettings({...scheduleSettings, timezone: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionnez un fuseau horaire" />
                      </SelectTrigger>
                      <SelectContent>
                        {timezones.map((tz) => (
                          <SelectItem key={tz.value} value={tz.value}>
                            {tz.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Jours de travail</Label>
                    <div className="space-y-2">
                      {daysOfWeek.map((day) => (
                        <div key={day.value} className="flex items-center gap-2">
                          <input
                            type="checkbox"
                            id={`day-${day.value}`}
                            checked={scheduleSettings.workDays.includes(day.value)}
                            onChange={(e) => {
                              const newWorkDays = e.target.checked
                                ? [...scheduleSettings.workDays, day.value]
                                : scheduleSettings.workDays.filter(d => d !== day.value);
                              setScheduleSettings({...scheduleSettings, workDays: newWorkDays});
                            }}
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                          />
                          <Label htmlFor={`day-${day.value}`} className="font-normal">
                            {day.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Heure d'ouverture</Label>
                      <Input 
                        type="time" 
                        value={scheduleSettings.workHours.start}
                        onChange={(e) => setScheduleSettings({
                          ...scheduleSettings, 
                          workHours: {...scheduleSettings.workHours, start: e.target.value}
                        })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Heure de fermeture</Label>
                      <Input 
                        type="time" 
                        value={scheduleSettings.workHours.end}
                        onChange={(e) => setScheduleSettings({
                          ...scheduleSettings, 
                          workHours: {...scheduleSettings.workHours, end: e.target.value}
                        })}
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Début d'année fiscale</Label>
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
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
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
                        <SelectTrigger className="w-20">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {Array.from({length: 12}, (_, i) => (i + 1).toString().padStart(2, '0')).map((month) => (
                            <SelectItem key={month} value={month}>{month}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label>Tolérance de pointage (minutes)</Label>
                    <Input 
                      type="number" 
                      min="0" 
                      max="60"
                      value={scheduleSettings.checkInTolerance}
                      onChange={(e) => setScheduleSettings({
                        ...scheduleSettings, 
                        checkInTolerance: parseInt(e.target.value) || 0
                      })}
                      className="w-24"
                    />
                    <p className="text-xs text-muted-foreground">
                      Délai de grâce pour les retards de pointage
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex justify-end pt-4 border-t">
                <Button 
                  onClick={() => handleSaveSettings("d'horaires")}
                  className="bg-primary hover:bg-primary/90"
                >
                  <Save className="h-4 w-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Onglet Sécurité */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <ShieldCheck className="h-5 w-5" />
                Paramètres de Sécurité
              </CardTitle>
              <CardDescription>
                Configurez les politiques de sécurité et les accès à l'application.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <h3 className="font-medium">Politique de mot de passe</h3>
                <div className="space-y-4 pl-4 border-l-2 border-muted">
                  <div className="flex items-center justify-between">
                    <div>
                      <Label>Longueur minimale</Label>
                      <p className="text-sm text-muted-foreground">
                        Nombre minimum de caractères requis
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Input 
                                        type="number" 
                                        min="6" 
                                        max="32"
                                        value={securitySettings.passwordPolicy.minLength}
                                        onChange={(e) => setSecuritySettings({
                                          ...securitySettings,
                                          passwordPolicy: {
                                            ...securitySettings.passwordPolicy,
                                            minLength: parseInt(e.target.value) || 8
                                          }
                                        })}
                                        className="w-20 text-right"
                                      />
                                      <span>caractères</span>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label>Exigences de complexité</Label>
                                      <p className="text-sm text-muted-foreground">
                                        Règles pour des mots de passe forts
                                      </p>
                                    </div>
                                    <div className="space-y-2">
                                      <div className="flex items-center gap-2">
                                        <Switch 
                                          id="require-uppercase"
                                          checked={securitySettings.passwordPolicy.requireUppercase}
                                          onCheckedChange={(checked) => setSecuritySettings({
                                            ...securitySettings,
                                            passwordPolicy: {
                                              ...securitySettings.passwordPolicy,
                                              requireUppercase: checked
                                            }
                                          })}
                                        />
                                        <Label htmlFor="require-uppercase" className="font-normal">
                                          Majuscules (A-Z)
                                        </Label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch 
                                          id="require-numbers"
                                          checked={securitySettings.passwordPolicy.requireNumbers}
                                          onCheckedChange={(checked) => setSecuritySettings({
                                            ...securitySettings,
                                            passwordPolicy: {
                                              ...securitySettings.passwordPolicy,
                                              requireNumbers: checked
                                            }
                                          })}
                                        />
                                        <Label htmlFor="require-numbers" className="font-normal">
                                          Chiffres (0-9)
                                        </Label>
                                      </div>
                                      <div className="flex items-center gap-2">
                                        <Switch 
                                          id="require-special"
                                          checked={securitySettings.passwordPolicy.requireSpecialChars}
                                          onCheckedChange={(checked) => setSecuritySettings({
                                            ...securitySettings,
                                            passwordPolicy: {
                                              ...securitySettings.passwordPolicy,
                                              requireSpecialChars: checked
                                            }
                                          })}
                                        />
                                        <Label htmlFor="require-special" className="font-normal">
                                          Caractères spéciaux (!@#$%^&*)
                                        </Label>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="flex items-center justify-between">
                                    <div>
                                      <Label>Expiration du mot de passe</Label>
                                      <p className="text-sm text-muted-foreground">
                                        Durée avant d'exiger un nouveau mot de passe
                                      </p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                      <Input 
                                        type="number" 
                                        min="1" 
                                        max="365"
                                        value={securitySettings.passwordPolicy.passwordExpiry}
                                        onChange={(e) => setSecuritySettings({
                                          ...securitySettings,
                                          passwordPolicy: {
                                            ...securitySettings.passwordPolicy,
                                            passwordExpiry: parseInt(e.target.value) || 90
                                          }
                                        })}
                                        className="w-20 text-right"
                                      />
                                      <span>jours</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                              
                              <Separator />
                              
                              <div className="space-y-4">
                                <div className="flex items-center justify-between">
                                  <div>
                                    <h3 className="font-medium">Authentification à deux facteurs (2FA)</h3>
                                    <p className="text-sm text-muted-foreground">
                                      Exiger une vérification supplémentaire pour la connexion
                                    </p>
                                  </div>
                                  <Switch 
                                    checked={securitySettings.twoFactorAuth}
                                    onCheckedChange={(checked) => setSecuritySettings({
                                      ...securitySettings,
                                      twoFactorAuth: checked
                                    })}
                                  />
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Déconnexion automatique</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Durée d'inactivité avant déconnexion
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      max="1440"
                                      value={securitySettings.sessionTimeout}
                                      onChange={(e) => setSecuritySettings({
                                        ...securitySettings,
                                        sessionTimeout: parseInt(e.target.value) || 30
                                      })}
                                      className="w-20 text-right"
                                    />
                                    <span>minutes</span>
                                  </div>
                                </div>
                                
                                <div className="flex items-center justify-between">
                                  <div>
                                    <Label>Nombre d'échecs de connexion</Label>
                                    <p className="text-sm text-muted-foreground">
                                      Tentatives avant verrouillage du compte
                                    </p>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <Input 
                                      type="number" 
                                      min="1" 
                                      max="10"
                                      value={securitySettings.failedLoginAttempts}
                                      onChange={(e) => setSecuritySettings({
                                        ...securitySettings,
                                        failedLoginAttempts: parseInt(e.target.value) || 5
                                      })}
                                      className="w-20 text-right"
                                    />
                                    <span>tentatives</span>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end pt-4 border-t">
                                <Button 
                                  onClick={() => handleSaveSettings("de sécurité")}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Enregistrer les modifications
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Onglet Email */}
                        <TabsContent value="email" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Mail className="h-5 w-5" />
                                Paramètres Email
                              </CardTitle>
                              <CardDescription>
                                Configurez les paramètres SMTP pour l'envoi d'emails depuis l'application.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-4">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="space-y-2">
                                  <Label>Serveur SMTP</Label>
                                  <Input 
                                    value={emailSettings.smtpHost}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      smtpHost: e.target.value
                                    })}
                                    placeholder="smtp.example.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Port SMTP</Label>
                                  <Input 
                                    type="number"
                                    value={emailSettings.smtpPort}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      smtpPort: parseInt(e.target.value) || 587
                                    })}
                                    placeholder="587"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Nom d'utilisateur SMTP</Label>
                                  <Input 
                                    value={emailSettings.smtpUsername}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      smtpUsername: e.target.value
                                    })}
                                    placeholder="user@example.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Mot de passe SMTP</Label>
                                  <Input 
                                    type="password"
                                    value={emailSettings.smtpPassword}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      smtpPassword: e.target.value
                                    })}
                                    placeholder="••••••••"
                                  />
                                </div>
                              </div>
                              
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-4">
                                <div className="space-y-2">
                                  <Label>Email d'expédition</Label>
                                  <Input 
                                    type="email"
                                    value={emailSettings.fromEmail}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      fromEmail: e.target.value
                                    })}
                                    placeholder="noreply@votredomaine.com"
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Nom d'expédition</Label>
                                  <Input 
                                    value={emailSettings.fromName}
                                    onChange={(e) => setEmailSettings({
                                      ...emailSettings,
                                      fromName: e.target.value
                                    })}
                                    placeholder="Votre Société"
                                  />
                                </div>
                              </div>
                              
                              <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mt-6">
                                <div className="flex">
                                  <div className="flex-shrink-0">
                                    <AlertCircle className="h-5 w-5 text-yellow-400" />
                                  </div>
                                  <div className="ml-3">
                                    <p className="text-sm text-yellow-700">
                                      Pour des raisons de sécurité, le mot de passe est masqué. Laissez le champ vide pour conserver le mot de passe actuel.
                                    </p>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end pt-4 border-t mt-6">
                                <Button 
                                  onClick={() => handleSaveSettings("d'email")}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Enregistrer les modifications
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        </TabsContent>

                        {/* Onglet Affichage */}
                        <TabsContent value="display" className="space-y-4">
                          <Card>
                            <CardHeader>
                              <CardTitle className="flex items-center gap-2">
                                <Palette className="h-5 w-5" />
                                Paramètres d'Affichage
                              </CardTitle>
                              <CardDescription>
                                Personnalisez l'apparence et le comportement de l'interface utilisateur.
                              </CardDescription>
                            </CardHeader>
                            <CardContent className="space-y-6">
                              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Thème de l'application</Label>
                                    <Select 
                                      value={displaySettings.theme}
                                      onValueChange={(value) => setDisplaySettings({
                                        ...displaySettings,
                                        theme: value
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un thème" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="light">Clair</SelectItem>
                                        <SelectItem value="dark">Sombre</SelectItem>
                                        <SelectItem value="system">Système</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Langue</Label>
                                    <Select 
                                      value={displaySettings.language}
                                      onValueChange={(value) => setDisplaySettings({
                                        ...displaySettings,
                                        language: value
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez une langue" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                                
                                <div className="space-y-4">
                                  <div className="space-y-2">
                                    <Label>Format de date</Label>
                                    <Select 
                                      value={displaySettings.dateFormat}
                                      onValueChange={(value) => setDisplaySettings({
                                        ...displaySettings,
                                        dateFormat: value
                                      })}
                                    >
                                      <SelectTrigger>
                                        <SelectValue placeholder="Sélectionnez un format" />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="DD/MM/YYYY">31/12/2023</SelectItem>
                                        <SelectItem value="MM/DD/YYYY">12/31/2023</SelectItem>
                                        <SelectItem value="YYYY-MM-DD">2023-12-31</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Format d'heure</Label>
                                    <div className="flex gap-4">
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id="time-24h"
                                          name="time-format"
                                          value="24h"
                                          checked={displaySettings.timeFormat === '24h'}
                                          onChange={() => setDisplaySettings({
                                            ...displaySettings,
                                            timeFormat: '24h'
                                          })}
                                          className="h-4 w-4 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="time-24h" className="font-normal">24 heures (14:30)</Label>
                                      </div>
                                      <div className="flex items-center space-x-2">
                                        <input
                                          type="radio"
                                          id="time-12h"
                                          name="time-format"
                                          value="12h"
                                          checked={displaySettings.timeFormat === '12h'}
                                          onChange={() => setDisplaySettings({
                                            ...displaySettings,
                                            timeFormat: '12h'
                                          })}
                                          className="h-4 w-4 text-primary focus:ring-primary"
                                        />
                                        <Label htmlFor="time-12h" className="font-normal">12 heures (2:30 PM)</Label>
                                      </div>
                                    </div>
                                  </div>
                                  
                                  <div className="space-y-2">
                                    <Label>Éléments par page</Label>
                                    <Select 
                                      value={displaySettings.itemsPerPage.toString()}
                                      onValueChange={(value) => setDisplaySettings({
                                        ...displaySettings,
                                        itemsPerPage: parseInt(value)
                                      })}
                                    >
                                      <SelectTrigger className="w-32">
                                        <SelectValue />
                                      </SelectTrigger>
                                      <SelectContent>
                                        <SelectItem value="10">10 éléments</SelectItem>
                                        <SelectItem value="25">25 éléments</SelectItem>
                                        <SelectItem value="50">50 éléments</SelectItem>
                                        <SelectItem value="100">100 éléments</SelectItem>
                                      </SelectContent>
                                    </Select>
                                  </div>
                                </div>
                              </div>
                              
                              <div className="flex justify-end pt-4 border-t">
                                <Button 
                                  onClick={() => handleSaveSettings("d'affichage")}
                                  className="bg-primary hover:bg-primary/90"
                                >
                                  <Save className="h-4 w-4 mr-2" />
                                  Enregistrer les modifications
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