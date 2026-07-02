import { useEffect, useState } from "react";
import type { ChangeEvent, CSSProperties } from "react";
import { supabase } from "./lib/supabase";
import type { User } from "@supabase/supabase-js";
import jsPDF from "jspdf";



type WorkerLocation = {
  worker_name: string;
  latitude: number | null;
  longitude: number | null;
  clock_in: string | null;
  status: string;
};

type Job = {
  id: string;
  title: string;
  location: string;
  status: string;
  assigned_to?: string | null;
  customer_name?: string | null;
  customer_phone?: string | null;
  customer_email?: string | null;
  job_address?: string | null;
  job_notes?: string | null;
  invoice_number?: string | null;
  invoice_due_date?: string | null;
  labor_amount?: number;
  materials_amount?: number;
  tax_amount?: number;
  total_amount?: number;
  scheduled_date?: string | null;
  scheduled_time?: string | null;
  before_photo?: string | null;
  after_photo?: string | null;
  completed_at?: string | null;
};
function App() {
  const [user, setUser] = useState<User | null>(null);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [clockedIn, setClockedIn] = useState(false);
  const [currentJob, setCurrentJob] = useState<Job | null>(null);
  const [uploading, setUploading] = useState(false);

  const [jobTitle, setJobTitle] = useState("");
  const [editingJobId, setEditingJobId] = useState<string | null>(null);
  const [jobLocation, setJobLocation] = useState("");
  const [assignedWorker, setAssignedWorker] = useState("");
  const [customerName, setCustomerName] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");
  const [jobAddress, setJobAddress] = useState("");
  const [jobNotes, setJobNotes] = useState("");
  const [adminNotice, setAdminNotice] = useState("");

  const [invoiceNumber, setInvoiceNumber] = useState("");
  const [invoiceDueDate, setInvoiceDueDate] = useState("");
  const [jobDate, setJobDate] = useState("");
  const [jobTime, setJobTime] = useState("");
  const [laborAmount, setLaborAmount] = useState("");
  const [materialsAmount, setMaterialsAmount] = useState("");
  const [taxAmount, setTaxAmount] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");

  const [employeeName, setEmployeeName] = useState("");
  const [employeeEmail, setEmployeeEmail] = useState("");
  const [employeePhone, setEmployeePhone] = useState("");
  const [employeeRate, setEmployeeRate] = useState("");
  const [employeeRole, setEmployeeRole] = useState("worker");
  const [newJobNotice, setNewJobNotice] = useState("");

  const [showSplash, setShowSplash] = useState(true);
  const [workerLocations, setWorkerLocations] = useState<WorkerLocation[]>([]);
  const [selectedWorkerHistory, setSelectedWorkerHistory] = useState<any[]>([]);
  const [workers, setWorkers] = useState<any[]>([]);
  const [timeLogs, setTimeLogs] = useState<any[]>([]);
  const [allJobs, setAllJobs] = useState<any[]>([]);




  const isAdmin = user?.email === "taofikbusari@gmail.com";

  const styles: Record<string, CSSProperties> = {
    page: {
      minHeight: "100vh",
      background: "#f3f4f6",
      padding: "30px",
      fontFamily: "Arial, sans-serif",
    },
    container: {
      maxWidth: "1100px",
      margin: "0 auto",
    },
    header: {
      background: "linear-gradient(135deg, #16a34a, #facc15, #f97316)",
      color: "#ffffff",
      padding: "30px",
      borderRadius: "18px",
      textAlign: "center",
      marginBottom: "25px",
      boxShadow: "0 12px 30px rgba(0,0,0,0.12)",
    },
    card: {
      background: "white",
      borderRadius: "14px",
      padding: "30px",
      marginBottom: "20px",
      boxShadow: "0 8px 24px rgba(0,0,0,0.08)",
      border: "1px solid #e5e7eb",
      borderTop: "3px solid #f97316",
    },
    grid: {
      display: "grid",
      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
      gap: "12px",
    },
    input: {
      padding: "12px",
      borderRadius: "8px",
      border: "1px solid #cbd5e1",
      width: "100%",
      boxSizing: "border-box",
      fontSize: "14px",
    },
    button: {
      background: "#ea580c",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      marginTop: "10px",
      marginRight: "8px",
    },
    greenButton: {
      background: "#16a34a",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      marginTop: "10px",
      marginRight: "8px",
      position: "relative",
      zIndex: 10,
      pointerEvents: "auto",
    },
    orangeButton: {
      background: "#ea580c",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      marginTop: "10px",
      marginRight: "8px",
      position: "relative",
      zIndex: 10,
      pointerEvents: "auto",
    },
    dangerButton: {
      background: "#dc2626",
      color: "white",
      padding: "10px 20px",
      borderRadius: "8px",
      border: "none",
      cursor: "pointer",
      fontWeight: "bold",
      marginTop: "10px",
      position: "relative",
      zIndex: 10,
      pointerEvents: "auto",
    },
    sectionTitle: {
      marginTop: 0,
      color: "#111827",
    },
  };

const loadCurrentJob = async (workerId: string) => {
  const { data, error } = await supabase
    .from("nge_jobs")
    .select("*")
    .eq("assigned_to", workerId)
    .in("status", ["pending", "in_progress"])
    .order("created_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error) {
    alert(error.message);
    return;
  }

  setCurrentJob(data);
};

  const loadWorkers = async () => {
    const { data, error } = await supabase
      .from("nge_workers")
      .select("id, full_name, email, role")
      .order("full_name", { ascending: true });

    if (error) {
      alert(error.message);
      return;
    }

    setWorkers(data || []);
  };

  const loadWorkerHistory = async (workerId: string) => {
    if (!workerId) {
      setSelectedWorkerHistory([]);
      return;
    }

    const { data, error } = await supabase
      .from("nge_jobs")
      .select("*")
      .eq("assigned_to", workerId)
      .order("created_at", { ascending: false });

    if (error) {
      alert(error.message);
      return;
    }

    setSelectedWorkerHistory(data || []);
  };

const loadWorkerLocations = async () => {
  const { data, error } = await supabase
    .from("nge_time_logs")
    .select("worker_name, latitude, longitude, clock_in, status")
    .not("latitude", "is", null)
    .not("longitude", "is", null)
    .order("clock_in", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  const latestByWorker: Record<string, WorkerLocation> = {};

  (data || []).forEach((log) => {
    const workerName = log.worker_name || "Unknown";

    if (!latestByWorker[workerName]) {
      latestByWorker[workerName] = log;
    }
  });

  setWorkerLocations(Object.values(latestByWorker));
};

const loadPayroll = async () => {
  const { data, error } = await supabase
    .from("nge_time_logs")
    .select(`
      worker_name,
      worker_id,
      clock_in,
      clock_out,
      total_hours,
      nge_workers (
        hourly_rate
      )
    `)
    .not("clock_out", "is", null)
    .order("clock_out", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  setTimeLogs(data || []);
};

const loadAllJobs = async () => {
  const { data, error } = await supabase
    .from("nge_jobs")
    .select("*")
    .order("created_at", { ascending: false });

  if (error) {
    alert(error.message);
    return;
  }

  setAllJobs(data || []);
  console.log("Jobs refreshed");
};

  useEffect(() => {
    const setupAuth = async () => {
      const { data } = await supabase.auth.getUser();

 if (data.user) {
   setUser(data.user);
   await loadCurrentJob(data.user.id);
   await loadWorkers();
   await loadWorkerLocations();
   await loadAllJobs();
   await loadPayroll();
 }
    };

    setupAuth();

    const { data: listener } = supabase.auth.onAuthStateChange(
      async (_event, session) => {
        const loggedInUser = session?.user ?? null;
        setUser(loggedInUser);

        if (loggedInUser) {
          await loadCurrentJob(loggedInUser.id);
          await loadWorkers();
          await loadWorkerLocations();
          await loadAllJobs();
          await loadPayroll();
        } else {
          setCurrentJob(null);

        }
      }
    );

    return () => listener.subscription.unsubscribe();
  }, []);

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2000);
    return () => clearTimeout(timer);
  }, []);

useEffect(() => {
  const channel = supabase
    .channel("jobs-live")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "nge_jobs",
      },
      async () => {
        await loadAllJobs();

        if (user?.id) {
          await loadCurrentJob(user.id);
        }
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

useEffect(() => {
  if (!user || isAdmin) return;

  const channel = supabase
    .channel("worker-job-notifications")
    .on(
      "postgres_changes",
      {
        event: "INSERT",
        schema: "public",
        table: "nge_jobs",
        filter: `assigned_to=eq.${user.id}`,
      },
      async (payload) => {
        const job: any = payload.new;

        setNewJobNotice(`New job assigned: ${job.title}`);
        await loadCurrentJob(user.id);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user, isAdmin]);
  const handleSignUp = async () => {
    const { data, error } = await supabase.auth.signUp({ email, password });

    if (error) return alert(error.message);

    if (data.user) {
      await supabase.from("nge_workers").insert([
        {
          id: data.user.id,
          full_name: fullName,
          email,
          role: "worker",
        },
      ]);
    }

    alert("Account created");
    await loadWorkers();
  };

const handleLogin = async () => {
  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) return alert(error.message);

  if (data.user) {
    setUser(data.user);
    await loadCurrentJob(data.user.id);
    await loadWorkers();
    await loadWorkerLocations();
    await loadAllJobs();
    await loadPayroll();
  }
};

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setCurrentJob(null);
  };

  const handleClockIn = async () => {
    if (!user) return;

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;

        const { error } = await supabase.from("nge_time_logs").insert([
          {
            worker_id: user.id,
            worker_name: user.email,
            clock_in: new Date().toISOString(),
            status: "clocked_in",
            latitude,
            longitude,
          },
        ]);

        if (error) {
          alert(error.message);
          return;
        }

        setClockedIn(true);
        await loadWorkerLocations();
        alert("Clocked in");
      },
      (error) => alert("GPS error: " + error.message)
    );
  };

  const handleClockOut = async () => {
    if (!user) return;

    const { data } = await supabase
      .from("nge_time_logs")
      .select("id, clock_in")
      .eq("worker_id", user.id)
      .is("clock_out", null)
      .order("clock_in", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!data) return alert("No open clock in");

    const clockOutTime = new Date().toISOString();

    const totalHours =
      (new Date(clockOutTime).getTime() - new Date(data.clock_in).getTime()) /
      1000 /
      60 /
      60;

    const { error } = await supabase
      .from("nge_time_logs")
      .update({
        clock_out: clockOutTime,
        total_hours: totalHours,
        status: "clocked_out",
      })
      .eq("id", data.id);

    if (error) {
      alert(error.message);
      return;
    }

    setClockedIn(false);
    await loadWorkerLocations();
    alert("Clocked out");
  };

  const handleCreateJob = async () => {
    if (!assignedWorker) {
      alert("Please assign a worker before creating the job.");
      return;
    }


    const totalAmount =
      Number(laborAmount || 0) +
      Number(materialsAmount || 0) +
      Number(taxAmount || 0);
if (editingJobId) {
  const { error } = await supabase
    .from("nge_jobs")
    .update({
      title: jobTitle,
      location: jobLocation,
      assigned_to: assignedWorker,
      customer_name: customerName,
      customer_phone: customerPhone,
      customer_email: customerEmail,
      job_address: jobAddress,
      job_notes: jobNotes,
      invoice_number: invoiceNumber,
      invoice_due_date: invoiceDueDate || null,
      labor_amount: Number(laborAmount || 0),
      materials_amount: Number(materialsAmount || 0),
      tax_amount: Number(taxAmount || 0),
      total_amount: totalAmount,
      scheduled_date: jobDate || null,
      scheduled_time: jobTime || null,
    })
    .eq("id", editingJobId);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Job updated");
  setEditingJobId(null);
  await loadAllJobs();
  return;
}
    const { error } = await supabase.from("nge_jobs").insert([
      {
        title: jobTitle,
        location: jobLocation,
        assigned_to: assignedWorker,
        scheduled_date: jobDate || null,
        scheduled_time: jobTime || null,
        customer_name: customerName,
        customer_phone: customerPhone,
        customer_email: customerEmail,
        job_address: jobAddress,
        job_notes: jobNotes,
        invoice_number: invoiceNumber,
        invoice_due_date: invoiceDueDate || null,
        labor_amount: Number(laborAmount || 0),
        materials_amount: Number(materialsAmount || 0),
        tax_amount: Number(taxAmount || 0),
        total_amount: totalAmount,
        status: "pending",
      },
    ]);

    if (error) {
      alert(error.message);
      return;
    }

    alert("Job created");
    await loadAllJobs();

    setJobTitle("");
    setJobLocation("");
    setAssignedWorker("");
    setCustomerName("");
    setCustomerPhone("");
    setCustomerEmail("");
    setJobAddress("");
    setJobNotes("");
    setInvoiceNumber("");
    setInvoiceDueDate("");
    setLaborAmount("");
    setMaterialsAmount("");
    setTaxAmount("");
    setSelectedWorkerHistory([]);
  };
const exportInvoicePDF = (job: any) => {
  const doc = new jsPDF();

  const labor = Number(job.labor_amount || 0);
  const materials = Number(job.materials_amount || 0);
  const tax = Number(job.tax_amount || 0);
  const total = Number(job.total_amount || labor + materials + tax);

  doc.setFontSize(20);
  doc.text("Next Generation Eneraie", 20, 20);

  doc.setFontSize(14);
  doc.text("INVOICE", 20, 32);

  doc.setFontSize(10);
  doc.text(`Invoice #: ${job.invoice_number || job.id}`, 20, 45);
  doc.text(`Due Date: ${job.invoice_due_date || "N/A"}`, 20, 52);
  doc.text(`Status: ${job.status || "pending"}`, 20, 59);

  doc.text(`Customer: ${job.customer_name || ""}`, 20, 75);
  doc.text(`Phone: ${job.customer_phone || ""}`, 20, 82);
  doc.text(`Email: ${job.customer_email || ""}`, 20, 89);
  doc.text(`Address: ${job.job_address || ""}`, 20, 96);

  doc.text(`Service: ${job.title || ""}`, 20, 112);
  doc.text(`Location: ${job.location || ""}`, 20, 119);
  doc.text(`Notes: ${job.job_notes || ""}`, 20, 126);

  doc.line(20, 138, 190, 138);

  doc.text("Labor", 20, 150);
  doc.text(`$${labor.toFixed(2)}`, 160, 150);

  doc.text("Materials", 20, 160);
  doc.text(`$${materials.toFixed(2)}`, 160, 160);

  doc.text("Tax", 20, 170);
  doc.text(`$${tax.toFixed(2)}`, 160, 170);

  doc.line(20, 178, 190, 178);

  doc.setFontSize(14);
  doc.text("Total Due", 20, 190);
  doc.text(`$${total.toFixed(2)}`, 160, 190);

  doc.setFontSize(10);
  doc.text("Customer Signature: __________________________", 20, 220);
  doc.text("Date: __________________", 20, 235);

  doc.save(`invoice-${job.invoice_number || job.customer_name || "nge"}.pdf`);
};

const handleCompleteJob = async () => {
  if (!currentJob || !user) return;

  const completedJobId = currentJob.id;

  const { error } = await supabase
    .from("nge_jobs")
    .update({
      status: "completed",
      completed_at: new Date().toISOString(),
    })
    .eq("id", completedJobId);

  if (error) {
    alert(error.message);
    return;
  }

  setCurrentJob(null);

  await loadAllJobs();
  await loadCurrentJob(user.id);

  alert("Job completed");
setAdminNotice(`${user?.email} completed ${currentJob?.title}`);
};

  const uploadPhoto = async (
    event: ChangeEvent<HTMLInputElement>,
    type: "before" | "after"
  ) => {
    if (!event.target.files || !currentJob) return;

    const file = event.target.files[0];
    const fileName = `${type}-${currentJob.id}-${Date.now()}-${file.name}`;

    setUploading(true);

    const { error: uploadError } = await supabase.storage
      .from("job-photos")
      .upload(fileName, file);

    if (uploadError) {
      alert(uploadError.message);
      setUploading(false);
      return;
    }

 const { data } = await supabase.storage
   .from("job-photos")
   .getPublicUrl(fileName);

    const { error } = await supabase
      .from("nge_jobs")
      .update({
        [`${type}_photo`]: data.publicUrl,
      })
      .eq("id", currentJob.id);

    setUploading(false);

    if (error) {
      alert(error.message);
      return;
    }

    alert(`${type} photo uploaded`);
  };
const handleStartJob = async () => {
  if (!currentJob) return;

  const { error } = await supabase
    .from("nge_jobs")
    .update({
      status: "in_progress",
    })
    .eq("id", currentJob.id);

  if (error) {
    alert(error.message);
    return;
  }

  await loadCurrentJob(user!.id);
  await loadAllJobs();
  alert("Job started");
};
const handleAddEmployee = async () => {
  if (
    !employeeName.trim() ||
    !employeeEmail.trim() ||
    !employeePhone.trim() ||
    !employeeRate.trim()
  ) {
    alert("Please fill out all employee fields.");
    return;
  }

  const { error } = await supabase.from("nge_workers").insert([
    {
      full_name: employeeName,
      email: employeeEmail,
      phone: employeePhone,
      hourly_rate: Number(employeeRate),
      role: employeeRole,
    },
  ]);

  if (error) {
    alert(error.message);
    return;
  }

  alert("Employee added successfully");

  setEmployeeName("");
  setEmployeeEmail("");
  setEmployeePhone("");
  setEmployeeRate("");
  setEmployeeRole("worker");

  await loadWorkers();
};
const exportPayrollPDF = () => {
  const doc = new jsPDF();

  doc.setFontSize(20);
  doc.text("Next Generation Eneraie", 20, 20);

  doc.setFontSize(14);
  doc.text("PAYROLL REPORT", 20, 32);

  let y = 50;

  Object.values(groupedPayroll).forEach((log: any) => {
    const hours = Number(log.total_hours || 0);
    const hourlyRate = Number(log.nge_workers?.hourly_rate || 25);

    const regularHours = Math.min(hours, 40);
    const overtimeHours = Math.max(hours - 40, 0);

    const totalPay =
      regularHours * hourlyRate +
      overtimeHours * hourlyRate * 1.5;

    doc.setFontSize(10);
    doc.text(`Worker: ${log.worker_name}`, 20, y);
    doc.text(`Hours: ${hours.toFixed(2)}`, 20, y + 7);
    doc.text(`Regular: ${regularHours.toFixed(2)}`, 20, y + 14);
    doc.text(`Overtime: ${overtimeHours.toFixed(2)}`, 20, y + 21);
    doc.text(`Rate: $${hourlyRate}/hr`, 20, y + 28);
    doc.text(`Total Pay: $${totalPay.toFixed(2)}`, 20, y + 35);

    y += 50;

    if (y > 260) {
      doc.addPage();
      y = 20;
    }
  });

  doc.save("payroll-report.pdf");
};

const totalHours = timeLogs.reduce(
  (sum, log) => sum + Math.max(Number(log.total_hours || 0), 0),
  0
);

  if (showSplash) {
    return (
      <div
        style={{
          minHeight: "100vh",
          background: "linear-gradient(135deg, #16a34a, #facc15, #f97316)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexDirection: "column",
          color: "white",
          textAlign: "center",
          padding: "20px",
        }}
      >
<img
  src="/logo.png"
  alt="NGE"
  style={{ width: "85px", marginBottom: "15px" }}
/>
   <h1
     style={{
       fontSize: "24px",
       fontWeight: "700",
       lineHeight: "1.25",
       textAlign: "center",
       maxWidth: "300px",
       margin: "0 auto",
     }}
   >
     Welcome to <br />
     Next Generation Eneraie
   </h1>
      </div>
    );
  }
if (!user) {
  return (
    <div style={styles.page}>
      <div style={{ ...styles.container, maxWidth: "480px" }}>
        <div style={styles.header}>
          <img
            src="/logo"
            alt="NGE"
            style={{ width: "110px", marginBottom: "15px" }}
          />

<h1
  style={{
    fontSize: "22px",
    fontWeight: "700",
    lineHeight: "1.1",
    marginBottom: "8px",
    textAlign: "center",
    maxWidth: "280px",
    margin: "0 auto 8px auto",
  }}
>
  NGE Worker Portal
</h1>

          <p style={{ fontSize: "14px" }}>
            Login or create a worker account
          </p>
        </div>

        <div style={styles.card}>
          <input
            style={styles.input}
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
          />
          <br />
          <br />

          <input
            style={styles.input}
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <br />
          <br />

          <input
            style={styles.input}
            placeholder="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <button style={styles.button} onClick={handleLogin}>
            Login
          </button>

          <button style={styles.greenButton} onClick={handleSignUp}>
            Create Account
          </button>
        </div>
      </div>
    </div>
  );
}

const groupedPayroll = timeLogs.reduce((acc: any, log: any) => {
  const worker = log.worker_name || "Unknown";
  const hours = Math.max(Number(log.total_hours || 0), 0);

  if (!acc[worker]) {
    acc[worker] = {
      worker_name: worker,
      total_hours: 0,
    };
  }

  acc[worker].total_hours += hours;

  return acc;
}, {});

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        <div style={styles.header}>
          <h1>NGE Dashboard</h1>
          <p>{user.email}</p>
          <button style={styles.dangerButton} onClick={handleLogout}>
            Logout
          </button>
        </div>

        {isAdmin && (
          <>
            <div style={styles.card}>
              <h2 style={styles.sectionTitle}>Admin Dashboard</h2>
              {adminNotice && (
                <div
                  style={{
                    background: "#dcfce7",
                    border: "1px solid green",
                    padding: "12px",
                    borderRadius: "8px",
                    marginBottom: "15px",
                    fontWeight: "bold",
                  }}
                >
                  {adminNotice}
                </div>
              )}
              <div
                style={{
                  background: "#fef3c7",
                  border: "1px solid #f59e0b",
                  padding: "12px",
                  borderRadius: "8px",
                  marginBottom: "15px",
                  fontWeight: "bold",
                }}
              >
                Pending Jobs: {allJobs.filter((job) => job.status === "pending").length}
              </div>
              <h3>Add Employee</h3>

              <div style={styles.grid}>
                <input
                  style={styles.input}
                  placeholder="Employee Name"
                  value={employeeName}
                  onChange={(e) => setEmployeeName(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Employee Email"
                  value={employeeEmail}
                  onChange={(e) => setEmployeeEmail(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Employee Phone"
                  value={employeePhone}
                  onChange={(e) => setEmployeePhone(e.target.value)}
                />
                <input
                  style={styles.input}
                  placeholder="Hourly Rate"
                  value={employeeRate}
                  onChange={(e) => setEmployeeRate(e.target.value)}
                />
                <select
                  style={styles.input}
                  value={employeeRole}
                  onChange={(e) => setEmployeeRole(e.target.value)}
                >
                  <option value="worker">Worker</option>
                  <option value="admin">Admin</option>
                </select>
              </div>

              <button style={styles.button} onClick={handleAddEmployee}>
                Add Employee
              </button>
            </div>

    <div style={styles.card}>
      <h3>Create Job</h3>

      <div style={styles.grid}>
        <input
          style={styles.input}
          list="job-title-list"
          placeholder="Job Title"
          value={jobTitle}
          onChange={(e) => setJobTitle(e.target.value)}
        />

<datalist id="job-title-list">
  {[
    ...new Set(
      allJobs
        .map((job) => job.title?.trim().toLowerCase())
        .filter(Boolean)
    ),
  ].map((title) => (
    <option
      key={title}
      value={title.charAt(0).toUpperCase() + title.slice(1)}
    />
  ))}
</datalist>

        <input style={styles.input} placeholder="Location" value={jobLocation} onChange={(e) => setJobLocation(e.target.value)} />
        <input style={styles.input} placeholder="Customer Name" value={customerName} onChange={(e) => setCustomerName(e.target.value)} />
        <input style={styles.input} placeholder="Customer Phone" value={customerPhone} onChange={(e) => setCustomerPhone(e.target.value)} />
        <input style={styles.input} placeholder="Customer Email" value={customerEmail} onChange={(e) => setCustomerEmail(e.target.value)} />
        <input style={styles.input} placeholder="Job Address" value={jobAddress} onChange={(e) => setJobAddress(e.target.value)} />
        <input style={styles.input} placeholder="Job Notes" value={jobNotes} onChange={(e) => setJobNotes(e.target.value)} />
        <input style={styles.input} placeholder="Invoice Number" value={invoiceNumber} onChange={(e) => setInvoiceNumber(e.target.value)} />
<div>
  <label style={{ fontWeight: "bold", fontSize: "13px" }}>
    Invoice Due Date
  </label>
  <input
    style={styles.input}
    type="date"
    value={invoiceDueDate}
    onChange={(e) => setInvoiceDueDate(e.target.value)}
  />
</div>

<div>
  <label style={{ fontWeight: "bold", fontSize: "13px" }}>
    Scheduled Job Date
  </label>
  <input
    style={styles.input}
    type="date"
    value={jobDate}
    onChange={(e) => setJobDate(e.target.value)}
  />
</div>

        <input style={styles.input} placeholder="Labor Amount" value={laborAmount} onChange={(e) => setLaborAmount(e.target.value)} />
        <input style={styles.input} placeholder="Materials Amount" value={materialsAmount} onChange={(e) => setMaterialsAmount(e.target.value)} />
        <input style={styles.input} placeholder="Tax Amount" value={taxAmount} onChange={(e) => setTaxAmount(e.target.value)} />

        <input style={styles.input} type="time" value={jobTime} onChange={(e) => setJobTime(e.target.value)} />
      </div>

      <div
        style={{
          marginTop: "20px",
          display: "flex",
          gap: "12px",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          style={{ ...styles.input, maxWidth: "280px" }}
          value={assignedWorker}
          onChange={async (e) => {
            setAssignedWorker(e.target.value);
            await loadWorkerHistory(e.target.value);
          }}
        >
          <option value="">Assign Worker</option>
          {workers.map((worker) => (
            <option key={worker.id} value={worker.id}>
              {worker.full_name || worker.email}
            </option>
          ))}
        </select>

        <button style={styles.greenButton} onClick={handleCreateJob}>
          {editingJobId ? "Update Job" : "Create Job"}
        </button>
      </div>
    </div>

            {assignedWorker && (
              <div style={styles.card}>
                <h3>Worker Job History</h3>

                {selectedWorkerHistory.length === 0 ? (
                  <p>No job history for this worker yet.</p>
                ) : (
                  selectedWorkerHistory.map((job, index) => (
                    <div
                      key={index}
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "10px 0",
                      }}
                    >
             <p>
               <strong>Job:</strong> {job.title}
             </p>
             <p>
               <strong>Customer:</strong> {job.customer_name}
             </p>
             <p>
               <strong>Phone:</strong> {job.customer_phone}
             </p>
             <p>
               <strong>Address:</strong> {job.job_address}
             </p>

           <p>
             <strong>Status:</strong>{" "}
             <span
               style={{
                 color:
                   job.status === "completed"
                     ? "green"
                     : job.status === "in_progress"
                     ? "blue"
                     : "orange",
                 fontWeight: "bold",
               }}
             >
               {job.status}
             </span>
           </p>

{job.status === "completed" && (
  <div
    style={{
      background: "#dcfce7",
      border: "1px solid green",
      padding: "10px",
      borderRadius: "8px",
      marginTop: "10px",
      fontWeight: "bold",
    }}
  >
    Job completed by worker
  </div>
)}
             <p>
               <strong>Total:</strong> ${job.total_amount}
             </p>
             <p>
               <strong>Completed:</strong> {job.completed_at || "Not completed yet"}
             </p>

             <button
               style={styles.greenButton}
               onClick={() => exportInvoicePDF(job)}
             >
               Export Invoice PDF
             </button>

                    </div>
                  ))
                )}
              </div>
            )}
            <div style={styles.card}>
              <h2>Live Worker Locations</h2>
              <button style={styles.button} onClick={loadWorkerLocations}>
                Refresh Locations
              </button>

              {workerLocations.length === 0 ? (
                <p>No worker GPS locations yet.</p>
              ) : (
                workerLocations.map((location, index) => (
                  <div
                    key={index}
                    style={{
                      borderBottom: "1px solid #eee",
                      padding: "12px 0",
                    }}
                  >
                    <p>
                      <strong>Worker:</strong> {location.worker_name}
                    </p>
                    <p>
                      <strong>Status:</strong> {location.status}
                    </p>
                    <p>
                      <strong>Clock In:</strong> {location.clock_in}
                    </p>
                    <a
                      href={`https://www.google.com/maps?q=${location.latitude},${location.longitude}`}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Open in Google Maps
                    </a>
                  </div>
                ))
              )}
            </div>

<div style={styles.card}>
  <h2>Job Review Board</h2>

  <button style={styles.button} onClick={loadAllJobs}>
    Refresh Jobs
  </button>

  {allJobs.length === 0 ? (
    <p>No jobs yet.</p>
  ) : (
    allJobs.map((job) => (
      <div
        key={job.id}
        style={{
          borderBottom: "1px solid #eee",
          padding: "12px 0",
        }}
      >
        <p>
          <strong>Job:</strong> {job.title}
        </p>

        <p>
          <strong>Status:</strong> {job.status}
        </p>

        <p>
          <strong>Customer:</strong> {job.customer_name}
        </p>

        <p>
          <strong>Scheduled:</strong>{" "}
          {job.scheduled_date || "No date"} {job.scheduled_time || ""}
        </p>

        <p>
          <strong>Total:</strong> $
          {Number(job.total_amount || 0).toFixed(2)}
        </p>

        <button
          style={styles.greenButton}
          onClick={() => exportInvoicePDF(job)}
        >
          Export Invoice PDF
        </button>

<button
 style={{ ...styles.button, position: "relative", zIndex: 20 }}
  onClick={() => {
    setEditingJobId(job.id);
    setJobTitle(job.title || "");
    setJobLocation(job.location || "");
    setCustomerName(job.customer_name || "");
    setCustomerPhone(job.customer_phone || "");
    setCustomerEmail(job.customer_email || "");
    setJobAddress(job.job_address || "");
    setJobNotes(job.job_notes || "");
    setInvoiceNumber(job.invoice_number || "");
    setInvoiceDueDate(job.invoice_due_date || "");
    setLaborAmount(job.labor_amount || "");
    setMaterialsAmount(job.materials_amount || "");
    setTaxAmount(job.tax_amount || "");
    setJobDate(job.scheduled_date || "");
    setJobTime(job.scheduled_time || "");
    setAssignedWorker(job.assigned_to || "");
  }}
>
  Edit Job
</button>
        <button
          style={styles.dangerButton}
          onClick={async () => {
            const confirmDelete = window.confirm("Delete this job?");
            if (!confirmDelete) return;

            const { error } = await supabase
              .from("nge_jobs")
              .delete()
              .eq("id", job.id);

            if (error) {
              alert(error.message);
              return;
            }

            alert("Job deleted");
            await loadAllJobs();
          }}
        >
          Delete Job
        </button>


        {job.before_photo && (
          <div style={{ marginTop: "10px" }}>
            <img src={job.before_photo} alt="Before" width="120" />
          </div>
        )}

        {job.after_photo && (
          <div style={{ marginTop: "10px" }}>
            <img src={job.after_photo} alt="After" width="120" />
          </div>
        )}
      </div>
    ))
  )}
</div>


<div style={styles.card}>
  <h2>Recently Completed Jobs</h2>

  {allJobs.filter((job) => job.status === "completed").length === 0 ? (
    <p>No completed jobs yet.</p>
  ) : (
    allJobs
      .filter((job) => job.status === "completed")
      .slice(0, 5)
      .map((job) => (
        <div
          key={job.id}
          style={{
            borderBottom: "1px solid #eee",
            padding: "12px 0",
          }}
        >
          <p>
            <strong>Job:</strong> {job.title}
          </p>
          <p>
            <strong>Customer:</strong> {job.customer_name}
          </p>
          <p>
            <strong>Completed At:</strong> {job.completed_at}
          </p>
        </div>
      ))
  )}
</div><div style={styles.card}>
        <h2>Worker Performance Analytics</h2>

        {workers.map((worker) => {
          const workerJobs = allJobs.filter(
            (job) => job.assigned_to === worker.id
          );

          const completedJobs = workerJobs.filter(
            (job) => job.status === "completed"
          );

          const pendingJobs = workerJobs.filter(
            (job) => job.status !== "completed"
          );

          return (
            <div
              key={worker.id}
              style={{
                borderBottom: "1px solid #eee",
                padding: "12px 0",
              }}
            >
              <p>
                <strong>Worker:</strong> {worker.full_name || worker.email}
              </p>
              <p>
                <strong>Total Jobs:</strong> {workerJobs.length}
              </p>
              <p>
                <strong>Completed:</strong> {completedJobs.length}
              </p>
              <p>
                <strong>Pending:</strong> {pendingJobs.length}
              </p>
            </div>
          );
        })}
      </div>


            <div style={styles.card}>
              <h2>Payroll Timesheet</h2>
              <button style={styles.button} onClick={loadPayroll}>
                Load Payroll
              </button>
              <button style={styles.greenButton} onClick={exportPayrollPDF}>
                Export Payroll PDF
              </button>

              <h3>Payroll Summary</h3>
              <p>
                <strong>Total Hours:</strong> {totalHours.toFixed(2)}
              </p>
              <p>
                <strong>Total Payroll:</strong> ${(totalHours * 25).toFixed(2)}
              </p>
              <p>
                <strong>Total Records:</strong> {timeLogs.length}
              </p>

              {timeLogs.length === 0 ? (
                <p>No payroll records yet.</p>
              ) : (
                Object.values(groupedPayroll).map((log: any, index) => {
                  const hours = Number(log.total_hours || 0);
           const hourlyRate = Number(log.nge_workers?.hourly_rate || 25);
               const regularHours = Math.min(hours, 40);
               const overtimeHours = Math.max(hours - 40, 0);

               const totalPay =
                 regularHours * hourlyRate +
                 overtimeHours * hourlyRate * 1.5;

                  return (
                    <div
                      key={index}
                      style={{
                        borderBottom: "1px solid #eee",
                        padding: "12px 0",
                      }}
                    >
                      <p>
                        <strong>Worker:</strong> {log.worker_name}
                      </p>
                      <p>
                        <strong>Hours:</strong> {hours.toFixed(2)}
                      </p>
                      <p>
                        <strong>Regular:</strong> {regularHours.toFixed(2)}
                      </p>

                      <p>
                        <strong>Overtime:</strong> {overtimeHours.toFixed(2)}
                      </p>
                      <p>
                        <strong>Rate:</strong> ${hourlyRate}/hr
                      </p>
                      <p>
                        <strong>Total Pay:</strong> ${totalPay.toFixed(2)}
                      </p>
                    </div>
                  );
                })
              )}
            </div>
          </>
        )}
{!isAdmin && (
  <>
    <div style={styles.card}>
      <h2>Time Tracking</h2>

      <button style={styles.greenButton} onClick={handleClockIn}>
        Clock In
      </button>

      <button style={styles.orangeButton} onClick={handleClockOut}>
        Clock Out
      </button>

      <p>{clockedIn ? "Status: Clocked In" : "Status: Not Clocked In"}</p>
    </div>

    {newJobNotice && (
      <div style={styles.card}>
        <h2>New Assignment</h2>
        <p>{newJobNotice}</p>
        <button style={styles.greenButton} onClick={() => setNewJobNotice("")}>
          Dismiss
        </button>
      </div>
    )}

    <div style={styles.card}>
      <h2>Current Job</h2>

      {currentJob && currentJob.status === "pending" && (
        <div
          style={{
            background: "#fef3c7",
            border: "1px solid #f59e0b",
            padding: "12px",
            borderRadius: "8px",
            marginBottom: "15px",
            fontWeight: "bold",
          }}
        >
          New job assigned. Please review and start the job.
        </div>
      )}

      {currentJob ? (
        <>
          <p><strong>Job:</strong> {currentJob.title}</p>
          <p><strong>Location:</strong> {currentJob.location}</p>
          <p><strong>Scheduled:</strong> {currentJob.scheduled_date} at {currentJob.scheduled_time}</p>
          <p>
            <strong>Status:</strong>{" "}
            <span
              style={{
                color:
                  currentJob.status === "completed"
                    ? "green"
                    : currentJob.status === "in_progress"
                    ? "blue"
                    : "orange",
                fontWeight: "bold",
              }}
            >
              {currentJob.status}
            </span>
          </p>

          {currentJob.status === "pending" && (
            <button style={styles.button} onClick={handleStartJob}>
              Start Job
            </button>
          )}

          {currentJob.status === "in_progress" && (
            <>
              <button style={styles.greenButton} onClick={handleCompleteJob}>
                Mark Complete
              </button>

              <h3>Before Work</h3>
              <input type="file" onChange={(e) => uploadPhoto(e, "before")} />

              <h3>After Work</h3>
              <input type="file" onChange={(e) => uploadPhoto(e, "after")} />
            </>
          )}

          {uploading && <p>Uploading...</p>}
        </>
      ) : (
        <p>No assigned job yet.</p>
      )}
    </div>
  </>
)}      </div>
      </div>
    );
  }

  export default App;